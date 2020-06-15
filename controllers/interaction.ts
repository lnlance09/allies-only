/* eslint-disable */
const Auth = require("../utils/authFunctions.ts")
const Aws = require("../utils/awsFunctions.ts")
const db = require("../models/index.ts")
const axios = require("axios")
const randomize = require("randomatic")
const sha1 = require("sha1")
const validator = require("validator")
/* eslint-enable */
const Department = db.department
const Interaction = db.interaction
const Officer = db.officer
const Op = db.Sequelize.Op

exports.create = async (req, res) => {
	const { file } = req.files
	const { description, officerId } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (typeof officerId === "undefined" || officerId === "") {
		return res
			.status(422)
			.send({ error: true, msg: "You must link this interaction to an officer" })
	}

	const image = file.data
	const timestamp = new Date().getTime()
	const fileName = `interactions/${randomize("aa", 24)}-${timestamp}.png`
	await Aws.uploadToS3(image, fileName, false)

	Interaction.create({
		description,
		officerId,
		userId: authenticated ? user.data.id : 1,
		video: ""
	})
		.then((data) => {
			const { id } = data.dataValues
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

	const limit = 10
	let where = {
		name: {
			[Op.like]: `%${q}%`
		}
	}

	if (typeof q === "undefined" || q === "") {
		where = {}
	}

	if (typeof state !== "undefined" && state !== "") {
		where.state = state
	}

	if (typeof type !== "undefined" && type !== "") {
		where.type = type
	}

	Interaction.findAll({
		attributes: ["id", "createdAt", "description", "video", "views"],
		limit,
		offset: page * limit,
		order: [["createdAt", "DESC"]],
		raw: true,
		required: true,
		where
	})
		.then((interactions) => {
			const hasMore = interactions.length === limit
			return res.status(200).send({
				error: false,
				hasMore,
				interactions,
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
			["id", "templateId"],
			"createdAt",
			["name", "templateName"],
			"s3Link",
			"user.id",
			"user.img",
			"user.name",
			"user.username"
		],
		include: [
			{
				model: User,
				required: true,
				attributes: []
			}
		],
		raw: true,
		required: true,
		where: {
			id
		}
	})
		.then(async (interactions) => {
			if (interactions.length === 0) {
				return res.status(404).send({
					error: true,
					msg: "That department does not exist"
				})
			}

			const interactionData = interactions[0]

			return res.status(200).send({
				error: false,
				interaction: interactionData,
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
		where: {
			createdBy: user.data.id,
			id
		},
		distinct: true,
		col: "interaction.id"
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
