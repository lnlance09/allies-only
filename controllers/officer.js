/* eslint-disable */
const Auth = require("../utils/authFunctions.js")
const Aws = require("../utils/awsFunctions.js")
const db = require("../models/index.js")
const capitalize = require("capitalize")
const fs = require("fs")
const randomize = require("randomatic")
const slugify = require("slugify")
const validator = require("validator")
const waitOn = require("wait-on")
const { thumbnail } = require("easyimage")
/* eslint-enable */
const Department = db.department
const Officer = db.officer
const OfficerInteraction = db.officerInteraction
const Op = db.Sequelize.Op

exports.create = async (req, res) => {
	let { firstName, lastName } = req.body
	const { department } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (typeof firstName === "undefined" || firstName === "") {
		return res.status(422).send({ error: true, msg: "You must provide a first name" })
	}

	if (typeof lastName === "undefined" || lastName === "") {
		return res.status(422).send({ error: true, msg: "You must provide a last name" })
	}

	if (typeof department === "undefined" || department === "") {
		return res.status(422).send({ error: true, msg: "You must provide the department" })
	}

	const _firstName = firstName.split(" ").join("").split("'").join("")
	const _lastName = lastName.split(" ").join("").split("'").join("")
	if (!validator.isAlpha(_firstName) || !validator.isAlpha(_lastName)) {
		return res.status(422).send({ error: true, msg: "Names can only contain letters" })
	}

	firstName = capitalize.words(firstName.trim())
	lastName = capitalize.words(lastName.trim())

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

	Officer.create({
		createdBy: authenticated ? user.data.id : 1,
		departmentId: department,
		firstName,
		lastName
	})
		.then(async (data) => {
			const officer = data.dataValues
			const slug = slugify(`${firstName} ${lastName} ${officer.id}`, {
				lower: true,
				replacement: "-",
				strict: true
			})

			Officer.update(
				{
					slug
				},
				{
					where: { id: officer.id }
				}
			).then(() => {
				officer.slug = slug
				return res.status(200).send({
					error: false,
					officer
				})
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.findAll = async (req, res) => {
	const { departmentId, forAutocomplete, forOptions, page, q } = req.query

	let limit = 20
	let order = [
		[db.Sequelize.col("interactionCount"), "DESC"],
		[db.Sequelize.col("lastName"), "DESC"]
	]
	let where = {
		[Op.or]: [
			{
				firstName: {
					[Op.like]: `%${q}%`
				}
			},
			{
				lastName: {
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

	let attributes = [
		[db.Sequelize.col("officer.firstName"), "firstName"],
		[db.Sequelize.col("officer.id"), "id"],
		[db.Sequelize.col("officer.img"), "img"],
		[db.Sequelize.col("officer.lastName"), "lastName"],
		[db.Sequelize.col("officer.position"), "position"],
		[db.Sequelize.col("officer.slug"), "slug"],
		[db.Sequelize.col("department.name"), "departmentName"],
		[
			db.Sequelize.fn(
				"COUNT",
				db.Sequelize.fn("DISTINCT", db.Sequelize.col("officerInteractions.id"))
			),
			"interactionCount"
		]
	]
	let include = [
		{
			attributes: [],
			model: Department,
			required: true
		},
		{
			attributes: [],
			model: OfficerInteraction,
			required: false
		}
	]

	if (forOptions === "1") {
		attributes = [
			[db.Sequelize.literal("'yellow'"), "color"],
			[db.Sequelize.col("department.id"), "departmentId"],
			[db.Sequelize.col("department.name"), "departmentName"],
			[
				db.Sequelize.fn(
					"concat",
					db.Sequelize.col("firstName"),
					"-",
					db.Sequelize.col("lastName"),
					"-",
					db.Sequelize.col("officer.id")
				),
				"key"
			],
			[
				db.Sequelize.fn(
					"concat",
					db.Sequelize.col("firstName"),
					" ",
					db.Sequelize.col("lastName"),
					" - ",
					db.Sequelize.col("department.name")
				),
				"text"
			],
			[db.Sequelize.col("officer.id"), "value"]
		]
		include = [
			{
				attributes: [],
				model: Department,
				required: true
			}
		]
		order = [["id", "DESC"]]
	}

	if (forAutocomplete === "1") {
		attributes = [
			[
				db.Sequelize.fn(
					"concat",
					db.Sequelize.col("officer.firstName"),
					" ",
					db.Sequelize.col("officer.lastName")
				),
				"name"
			],
			[db.Sequelize.col("officer.img"), "img"],
			[db.Sequelize.col("department.name"), "departmentName"],
			[db.Sequelize.col("officer.slug"), "slug"],
			[db.Sequelize.literal("'officer'"), "type"]
		]
		include = [
			{
				attributes: [],
				model: Department,
				required: true
			}
		]
		limit = 3
		order = [["id", "DESC"]]
	}

	const offset = isNaN(page) ? 0 : page * limit

	Officer.findAll({
		attributes,
		group: ["officer.id"],
		include,
		limit,
		offset,
		order,
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
			return res.status(200).send({
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
			[db.Sequelize.col("officer.id"), "id"],
			[db.Sequelize.col("officer.img"), "img"],
			[db.Sequelize.col("officer.lastName"), "lastName"],
			[db.Sequelize.col("officer.position"), "position"],
			[db.Sequelize.col("officer.slug"), "slug"],
			[db.Sequelize.col("department.id"), "departmentId"],
			[db.Sequelize.col("department.name"), "departmentName"],
			[db.Sequelize.col("department.slug"), "departmentSlug"],
			[
				db.Sequelize.fn(
					"COUNT",
					db.Sequelize.fn("DISTINCT", db.Sequelize.col("officerInteractions.id"))
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
				model: OfficerInteraction
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
				return res.status(200).send({
					error: true,
					msg: "That meme does not exist"
				})
			}

			const officer = officers[0]
			if (officer.id === null) {
				return res.status(200).send({
					error: true,
					msg: "That officer does not exist"
				})
			}

			return res.status(200).send({
				error: false,
				officer
			})
		})
		.catch((err) => {
			return res.status(200).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.update = async (req, res) => {
	const { id } = req.params
	const { firstName, lastName } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	const count = await Officer.count({
		where: {
			createdBy: user.data.id,
			id
		},
		distinct: true,
		col: "officer.id"
	}).then((count) => count)

	if (count === 0) {
		return res
			.status(401)
			.send({ error: true, msg: "You don't have permission to edit this meme" })
	}

	const updateData = {}
	if (typeof firstName !== "undefined" && firstName !== "") {
		updateData.firstName = firstName
	}

	if (typeof lastName !== "undefined" && lastName !== "") {
		updateData.lastName = lastName
	}

	Officer.update(updateData, {
		where: { id }
	})
		.then(async () => {
			const officer = await Officer.findByPk(id, { raw: true })
			return res.status(200).send({
				error: false,
				msg: "Success",
				officer
			})
		})
		.catch(() => {
			return res.status(500).send({
				error: true,
				msg: "There was an error"
			})
		})
}

exports.updateImg = async (req, res) => {
	const { id } = req.params
	const { file } = req.files
	const { authenticated } = Auth.parseAuthentication(req)

	if (!authenticated) {
		// return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	if (typeof file === "undefined") {
		return res.status(401).send({ error: true, msg: "You must include a picture" })
	}

	const image = file.data
	const timestamp = new Date().getTime()
	const fileName = `${randomize("aa", 24)}-${timestamp}-${file.name}`

	fs.writeFile(`uploads/${fileName}`, image, "buffer", (err) => {
		if (err) {
			return res.status(500).send({
				error: true,
				msg: "There was an error"
			})
		}
	})

	const thumbnailInfo = await thumbnail({
		src: `uploads/${fileName}`,
		width: 250,
		height: 250
	})

	fs.readFile(thumbnailInfo.path, async (err, data) => {
		if (err) {
			throw err
		}

		const filePath = `officers/${fileName}`
		await Aws.uploadToS3(data, filePath, false)

		Officer.update(
			{
				img: filePath
			},
			{
				where: { id }
			}
		)
			.then(async () => {
				await waitOn({
					resources: [`https://alliesonly.s3-us-west-2.amazonaws.com/${filePath}`]
				})
				fs.unlinkSync(`uploads/${fileName}`)

				return res.status(200).send({
					error: false,
					img: filePath,
					msg: "success"
				})
			})
			.catch(() => {
				return res.status(500).send({
					error: true,
					msg: "There was an error"
				})
			})
	})
}
