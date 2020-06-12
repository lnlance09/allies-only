/* eslint-disable */
const Auth = require("../utils/authFunctions.ts")
const Aws = require("../utils/awsFunctions.ts")
const db = require("../models/index.ts")
const axios = require("axios")
const randomize = require("randomatic")
const sha1 = require("sha1")
const validator = require("validator")
/* eslint-enable */
const MemeTemplate = db.memeTemplate
const Template = db.template
const User = db.user
const Op = db.Sequelize.Op

exports.create = async (req, res) => {
	const { img, name } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (typeof img === "undefined" || img === "") {
		return res.status(422).send({ error: true, msg: "You must provide an image" })
	}

	let image = img
	const timestamp = new Date().getTime()
	const fileName = `templates/${randomize("aa", 24)}-${timestamp}.png`
	const hash = sha1(image)

	const templateId = await Template.findAll({
		required: true,
		attributes: ["id"],
		where: {
			hash
		},
		raw: true
	}).then((template) => {
		if (template.length === 1) {
			return template[0].id
		}

		return false
	})

	if (templateId) {
		return res.status(200).send({
			error: false,
			id: templateId,
			msg: "success"
		})
	}

	if (validator.isURL(img)) {
		const imageFromUrl = await axios.get(img, { responseType: "arraybuffer" })
		image = Buffer.from(imageFromUrl.data).toString("base64")
	}

	await Aws.uploadToS3(image, fileName)

	Template.create({
		createdBy: authenticated ? user.id : 1,
		hash,
		name,
		s3Link: fileName
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
	const { page, q, userId } = req.query

	const limit = 10
	let where = {
		name: {
			[Op.like]: `%${q}%`
		}
	}

	if (typeof q === "undefined" || q === "") {
		where = {}
	}

	if (typeof userId !== "undefined" && userId !== "") {
		where.createdBy = userId
	}

	Template.findAll({
		required: true,
		attributes: ["id", "name", "s3Link"],
		where,
		offset: page * limit,
		limit,
		order: [["createdAt", "DESC"]],
		raw: true
	})
		.then((templates) => {
			const hasMore = templates.length === limit
			return res.status(200).send({
				error: false,
				hasMore,
				msg: "Success",
				page: parseInt(page) + 1,
				templates
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

	Template.findAll({
		required: true,
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
		where: {
			id
		},
		raw: true,
		include: [
			{
				model: User,
				required: true,
				attributes: []
			}
		]
	})
		.then(async (template) => {
			if (template.length === 0) {
				return res.status(404).send({
					error: true,
					msg: "That template does not exist"
				})
			}

			const count = await MemeTemplate.count({
				where: {
					templateId: id
				},
				distinct: true,
				col: "memeTemplate.memeId"
			}).then((count) => count)

			const templateData = template[0]
			templateData.memeCount = count

			return res.status(200).send({
				error: false,
				msg: "Success",
				template: templateData
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
	const { name } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	const count = await Template.count({
		where: {
			createdBy: user.data.id,
			id
		},
		distinct: true,
		col: "template.id"
	}).then((count) => count)

	if (count === 0) {
		return res
			.status(401)
			.send({ error: true, msg: "You don't have permission to edit this template" })
	}

	const updateData = {}
	if (typeof name !== "undefined" && name !== "") {
		updateData.name = name
	}

	Template.update(updateData, {
		where: { id }
	})
		.then(async () => {
			const template = await Template.findByPk(id, { raw: true })
			return res.status(200).send({
				error: false,
				msg: "Success",
				template
			})
		})
		.catch(() => {
			return res.status(500).send({
				error: true,
				msg: "There was an error"
			})
		})
}
