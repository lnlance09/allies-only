/* eslint-disable */
const Auth = require("../utils/authFunctions.ts")
const Aws = require("../utils/awsFunctions.ts")
const db = require("../models/index.ts")
const slugify = require("slugify")
/* eslint-enable */
const Department = db.department
const Interaction = db.interaction
const Officer = db.officer
const User = db.user
const Op = db.Sequelize.Op

exports.create = async (req, res) => {
	const { department, firstName, lastName } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (typeof firstName === "undefined" || firstName === "") {
		return res
			.status(422)
			.send({ error: true, msg: "You must provide the first name of the officer" })
	}

	if (typeof lastName === "undefined" || lastName === "") {
		return res
			.status(422)
			.send({ error: true, msg: "You must provide the last name of the officer" })
	}

	const departmentCount = await Department.count({
		col: "department.id",
		distinct: true,
		where: {
			id: department
		}
	}).then((count) => count)

	if (departmentCount === 0) {
		return res.status(422).send({ error: true, msg: "That department does not exist" })
	}

	const officerCount = await Officer.count({
		col: "officer.id",
		distinct: true,
		where: {
			departmentId: department,
			firstName,
			lastName
		}
	}).then((count) => count)

	if (officerCount > 0) {
		return res.status(422).send({ error: true, msg: "That officer already exists" })
	}

	const officer = await Officer.create({
		createdBy: authenticated ? user.data.id : 1,
		departmentId: department,
		firstName,
		lastName
	})
		.then((data) => {
			return data.dataValues
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})

	const slug = slugify(`${firstName} ${lastName} ${officer.id}`, {
		replacement: "-",
		lower: true
	})

	await Officer.update(
		{
			slug
		},
		{
			where: { id: officer.id }
		}
	).then(() => {
		return res.status(200).send({
			error: false,
			officer
		})
	})
}

exports.findAll = async (req, res) => {
	const { departmentId, page, q } = req.query

	const limit = 10
	let where = {
		[Op.or]: [
			{
				name: {
					[Op.like]: `%${q}%`
				}
			}
		]
	}

	if (typeof q === "undefined" || q === "") {
		where = {}
	}

	if (typeof departmentId !== "undefined" && departmentId !== "") {
		where.departmentId = departmentId
	}

	Officer.findAll({
		attributes: [
			// [db.Sequelize.col("officer.badgeNumber"), "badgeNumber"],
			[db.Sequelize.col("officer.firstName"), "firstName"],
			[db.Sequelize.col("officer.img"), "img"],
			[db.Sequelize.col("officer.lastName"), "lastName"],
			[db.Sequelize.col("officer.position"), "position"],
			[db.Sequelize.col("officer.slug"), "slug"],
			[db.Sequelize.col("department.name"), "departmentName"],
			[
				db.Sequelize.fn(
					"COUNT",
					db.Sequelize.fn("DISTINCT", db.Sequelize.col("interactions.id"))
				),
				"interactionCount"
			]
		],
		include: [
			{
				attributes: [],
				model: Department,
				required: true
			},
			{
				attributes: [],
				model: Interaction
			}
		],
		group: ["officer.id"],
		limit,
		offset: page * limit,
		order: [["id", "DESC"]],
		raw: true,
		subQuery: false,
		where
	})
		.then((officers) => {
			const hasMore = officers.length === limit
			return res.status(200).send({
				error: false,
				hasMore,
				msg: "Success",
				officers,
				page: parseInt(page) + 1
			})
		})
		.catch((err) => {
			console.log(err)
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.findOne = async (req, res) => {
	const { id } = req.params

	Officer.findAll({
		attributes: [
			[db.Sequelize.col("officer.createdAt"), "createdAt"],
			[db.Sequelize.col("officer.firstName"), "firstName"],
			[db.Sequelize.col("officer.img"), "img"],
			[db.Sequelize.col("officer.lastName"), "lastName"],
			[db.Sequelize.col("officer.position"), "position"],
			[db.Sequelize.col("officer.slug"), "slug"],
			[db.Sequelize.col("department.name"), "departmentName"],
			[db.Sequelize.col("department.id"), "departmentId"],
			[
				db.Sequelize.fn(
					"COUNT",
					db.Sequelize.fn("DISTINCT", db.Sequelize.col("interactions.id"))
				),
				"interactionCount"
			]
		],
		include: [
			{
				attributes: [],
				model: Department,
				required: true
			},
			{
				attributes: [],
				model: Interaction
			}
		],
		order: [["id", "ASC"]],
		raw: true,
		where: {
			slug: id
		}
	})
		.then((officers) => {
			if (officers.length === 0) {
				return res.status(404).send({
					error: true,
					msg: "That meme does not exist"
				})
			}

			const officer = officers[0]
			return res.status(200).send({
				error: false,
				officer
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.updateImg = async (req, res) => {
	const { id } = req.params
	const { file } = req.body

	if (typeof file === "undefined") {
		return res.status(401).send({ error: true, msg: "You must include a picture" })
	}

	const timestamp = new Date().getTime()
	const fileName = `memes/${randomize("aa", 24)}-${timestamp}.png`
	await Aws.uploadToS3(file, fileName)

	Meme.update(
		{
			s3Link: fileName
		},
		{
			where: { id }
		}
	)
		.then(() => {
			return res.status(200).send({
				error: false,
				msg: "Success",
				s3Link: fileName
			})
		})
		.catch(() => {
			return res.status(500).send({
				error: true,
				msg: "There was an error"
			})
		})
}

exports.update = async (req, res) => {
	const { id } = req.params
	const { caption, name } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	const count = await Meme.count({
		where: {
			createdBy: user.data.id,
			id
		},
		distinct: true,
		col: "meme.id"
	}).then((count) => count)

	if (count === 0) {
		return res
			.status(401)
			.send({ error: true, msg: "You don't have permission to edit this meme" })
	}

	const updateData = {}
	if (typeof caption !== "undefined" && caption !== "") {
		updateData.caption = caption
	}

	if (typeof name !== "undefined" && name !== "") {
		updateData.name = name
	}

	Meme.update(updateData, {
		where: { id }
	})
		.then(async () => {
			const meme = await Meme.findByPk(id, { raw: true })
			return res.status(200).send({
				error: false,
				meme,
				msg: "Success"
			})
		})
		.catch(() => {
			return res.status(500).send({
				error: true,
				msg: "There was an error"
			})
		})
}
