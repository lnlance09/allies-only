/* eslint-disable */
const Auth = require("../utils/authFunctions.ts")
const Aws = require("../utils/awsFunctions.ts")
const db = require("../models/index.ts")
const axios = require("axios")
const path = require("path")
const randomize = require("randomatic")
const slugify = require("slugify")
const validator = require("validator")
/* eslint-enable */
const Department = db.department
const Interaction = db.interaction
const Officer = db.officer
const OfficerInteraction = db.officerInteraction
const User = db.user
const Op = db.Sequelize.Op

exports.create = async (req, res) => {
	const { department, description, file, officer, title } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (typeof title === "undefined" || title === "") {
		return res.status(422).send({ error: true, msg: "You must provide a title" })
	}

	if (typeof department === "undefined" || department === "") {
		return res
			.status(422)
			.send({ error: true, msg: "You must link this interaction to a department" })
	}

	if (typeof file === "undefined" || file === "") {
		return res.status(422).send({ error: true, msg: "You must provide a video" })
	}

	Interaction.create({
		departmentId: department,
		description,
		title,
		userId: authenticated ? user.data.id : 1,
		video: file,
		views: 1
	})
		.then((data) => {
			const { id } = data.dataValues
			const officers = JSON.parse(officer)
			officers.map((o) => {
				if (isNaN(o.value)) {
					const names = o.value.split(" ")
					const firstName = names[0]
					const lastName = names[names.length - 1]

					Officer.create({
						createdBy: authenticated ? user.data.id : 1,
						departmentId: department,
						firstName,
						lastName
					}).then((data) => {
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
							OfficerInteraction.create({
								interactionId: id,
								officerId: officer.id
							})
						})
					})
				} else {
					OfficerInteraction.create({
						interactionId: id,
						officerId: o.value
					})
				}
			})

			return res.status(200).send({
				error: false,
				id,
				msg: "Success"
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.findAll = (req, res) => {
	const { departmentId, officerId, page, q, userId } = req.query

	const limit = 20
	let where = {
		[Op.or]: [
			{
				description: {
					[Op.like]: `%${q}%`
				}
			},
			{
				title: {
					[Op.like]: `%${q}%`
				}
			}
		]
	}

	const departmentWhere = {}
	let departmentRequired = false

	const officerWhere = {}
	let officerRequired = false

	const userWhere = {}
	let userRequired = false

	if (typeof q === "undefined" || q === "") {
		where = {}
	}

	if (typeof departmentId !== "undefined" && departmentId !== "") {
		departmentWhere["id"] = departmentId
		departmentRequired = true
	}

	if (typeof officerId !== "undefined" && officerId !== "") {
		officerWhere["officerId"] = officerId
		officerRequired = true
	}

	if (typeof userId !== "undefined" && userId !== "") {
		userWhere["id"] = userId
		userRequired = true
	}

	const offset = isNaN(page) ? 0 : page * limit

	Interaction.findAll({
		attributes: [
			[db.Sequelize.col("interaction.createdAt"), "createdAt"],
			[db.Sequelize.col("interaction.description"), "description"],
			[db.Sequelize.col("interaction.id"), "id"],
			[db.Sequelize.col("interaction.title"), "title"],
			[db.Sequelize.col("interaction.video"), "video"],
			[db.Sequelize.col("interaction.views"), "views"],
			[db.Sequelize.col("department.name"), "departmentName"],
			[db.Sequelize.col("department.slug"), "departmentSlug"],
			[db.Sequelize.col("officerInteractions.officerId"), "officerId"]
		],
		group: ["interaction.id"],
		include: [
			{
				attributes: [],
				model: Department,
				required: departmentRequired,
				where: departmentWhere
			},
			{
				attributes: ["officerId"],
				model: OfficerInteraction,
				required: officerRequired,
				where: officerWhere
			},
			{
				attributes: [],
				model: User,
				required: userRequired,
				where: userWhere
			}
		],
		limit,
		offset,
		order: [["createdAt", "DESC"]],
		raw: true,
		required: true,
		subQuery: false,
		where
	})
		.then((interactions) => {
			const hasMore = interactions.length === limit
			return res.status(200).send({
				error: false,
				hasMore,
				interactions: interactions,
				msg: "Success",
				page: parseInt(page) + 1
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.findOne = (req, res) => {
	const { id } = req.params

	Interaction.findAll({
		attributes: [
			[db.Sequelize.col("interaction.createdAt"), "createdAt"],
			[db.Sequelize.col("interaction.description"), "description"],
			[db.Sequelize.col("interaction.id"), "id"],
			[db.Sequelize.col("interaction.title"), "title"],
			[db.Sequelize.col("interaction.video"), "video"],
			[db.Sequelize.col("interaction.views"), "views"],
			[db.Sequelize.col("user.img"), "userImg"],
			[db.Sequelize.col("user.name"), "userName"],
			[db.Sequelize.col("user.username"), "username"],
			[db.Sequelize.col("department.name"), "departmentName"],
			[db.Sequelize.col("department.slug"), "departmentSlug"],
			[db.Sequelize.col("officerInteractions->officers.firstName"), "officerFirstName"],
			[db.Sequelize.col("officerInteractions->officers.id"), "officerId"],
			[db.Sequelize.col("officerInteractions->officers.img"), "officerImg"],
			[db.Sequelize.col("officerInteractions->officers.lastName"), "officerLastName"],
			[db.Sequelize.col("officerInteractions->officers.slug"), "officerSlug"]
		],
		include: [
			{
				attributes: [],
				model: User,
				required: true
			},
			{
				attributes: [],
				model: Department,
				required: true
			},
			{
				attributes: [],
				include: [
					{
						as: "officers",
						attributes: [],
						model: Officer,
						required: true
					}
				],
				model: OfficerInteraction,
				required: false,
				subQuery: false
			}
		],
		raw: true,
		required: true,
		where: {
			id
		}
	})
		.then((interactions) => {
			if (interactions.length === 0) {
				return res.status(404).send({
					error: true,
					msg: "That interaction does not exist"
				})
			}

			const firstRow = interactions[0]
			const interaction = {
				createdAt: firstRow["createdAt"],
				department: {
					name: firstRow["departmentName"],
					slug: firstRow["departmentSlug"]
				},
				description: firstRow["description"],
				officers: [],
				title: firstRow["title"],
				video: firstRow["video"],
				views: firstRow["views"],
				user: {
					img: firstRow["userImg"],
					name: firstRow["userName"],
					username: firstRow["username"]
				}
			}

			const officerIds = []
			interactions.map((_interaction) => {
				const { officerId } = _interaction
				const exists = officerIds.includes(officerId)

				if (!exists && officerId !== null) {
					officerIds.push(officerId)
					interaction.officers.push({
						firstName: _interaction.officerFirstName,
						id: _interaction.officerId,
						img: _interaction.officerImg,
						lastName: _interaction.officerLastName,
						slug: _interaction.officerSlug
					})
				}
			})

			return res.status(200).send({
				error: false,
				interaction,
				msg: "Success"
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.update = async (req, res) => {
	const { id } = req.params
	const { description, officerId } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	const count = await Interaction.count({
		col: "interaction.id",
		distinct: true,
		where: {
			createdBy: user.data.id,
			id
		}
	}).then((count) => count)

	if (count === 0) {
		return res
			.status(401)
			.send({ error: true, msg: "You don't have permission to edit this interaction" })
	}

	const updateData = {
		description,
		officerId
	}

	Interaction.update(updateData, {
		where: { id }
	})
		.then(async () => {
			const interaction = await Interaction.findByPk(id, { raw: true })
			return res.status(200).send({
				error: false,
				msg: "Success",
				interaction
			})
		})
		.catch(() => {
			return res.status(500).send({
				error: true,
				msg: "There was an error"
			})
		})
}

exports.updateViews = async (req, res) => {
	const { id } = req.params

	Interaction.increment("views", { where: { id } })

	return res.status(200).send({
		error: false,
		msg: "Views updated"
	})
}

exports.uploadVideo = async (req, res) => {
	if (typeof req.files === "undefined") {
		return res.status(422).send({ error: true, msg: "You must include a video" })
	}

	const { file } = req.files
	const ext = path.extname(file.name)
	const extensions = [".avi", ".flv", ".m4v", ".mp4", ".mkv", ".webm"]

	if (!extensions.includes(ext)) {
		return res.status(401).send({ error: true, msg: "That video format is not allowed" })
	}

	const video = file.data
	const timestamp = new Date().getTime()
	const fileName = `interactions/${randomize("aa", 24)}-${timestamp}${ext}`
	await Aws.uploadToS3(video, fileName, false, "video/mp4")

	setTimeout(() => {
		return res.status(200).send({
			error: false,
			video: fileName
		})
	}, 60000)
}
