/* eslint-disable */
const Auth = require("../utils/authFunctions.ts")
const Aws = require("../utils/awsFunctions.ts")
const db = require("../models/index.ts")
const randomize = require("randomatic")
/* eslint-enable */
const Meme = db.meme
const MemeTemplate = db.memeTemplate
const Template = db.template
const TemplateText = db.templateText
const User = db.user
const Op = db.Sequelize.Op

exports.create = async (req, res) => {
	const { caption, images } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (typeof images === "undefined") {
		return res.status(422).send({ error: true, msg: "You must include at least one image" })
	}

	if (images.length === 0) {
		return res.status(422).send({ error: true, msg: "You must include at least one image" })
	}

	let containsImg = false
	await images.map((img) => {
		if (typeof img.img !== "undefined" && img.img !== "") {
			containsImg = true
		}

		if (typeof img.path !== "undefined" && img.path !== "") {
			containsImg = true
		}
	})

	if (!containsImg) {
		return res.status(422).send({ error: true, msg: "You must include at least one image" })
	}

	const meme = await Meme.create({
		caption,
		createdBy: authenticated ? user.data.id : 1
	})
		.then((data) => {
			const { id } = data.dataValues
			return {
				id
			}
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})

	const memeId = meme.id

	images.map(async (_img) => {
		const { templateId, texts } = _img

		if (templateId) {
			texts.map(async (text) => {
				TemplateText.create({
					backgroundColor: text.backgroundColor,
					fontColor: text.color,
					fontFamily: text.font,
					fontSize: text.size,
					height: _img.height,
					text: text.text,
					width: _img.width,
					x: text.x,
					y: text.y
				})
					.then((data) => {
						const { id } = data.dataValues
						MemeTemplate.create({
							memeId,
							templateId,
							textId: id
						})
							.then(() => null)
							.catch((err) => {
								return res.status(500).send({
									error: true,
									msg: err.message || "An error occurred"
								})
							})
					})
					.catch((err) => {
						return res.status(500).send({
							error: true,
							msg: err.message || "An error occurred"
						})
					})
			})
		}
	})

	return res.status(200).send({
		error: false,
		id: memeId,
		msg: "Success"
	})
}

exports.findAll = async (req, res) => {
	const { page, q, templateId, userId } = req.query

	const limit = 10
	const where = {}
	let memeWhere = {
		[Op.or]: [
			{
				caption: {
					[Op.like]: `%${q}%`
				}
			},
			{
				name: {
					[Op.like]: `%${q}%`
				}
			}
		]
	}

	if (typeof q === "undefined" || q === "") {
		memeWhere = {}
	}

	if (typeof userId !== "undefined" && userId !== "") {
		memeWhere.createdBy = userId
	}

	if (typeof templateId !== "undefined" && templateId !== "") {
		where.templateId = templateId
	}

	MemeTemplate.findAll({
		attributes: [
			[db.Sequelize.col("meme.caption"), "caption"],
			[db.Sequelize.col("meme.createdAt"), "createdAt"],
			[db.Sequelize.col("meme.createdBy"), "createdBy"],
			[db.Sequelize.col("meme.id"), "id"],
			[db.Sequelize.col("meme.name"), "name"],
			[db.Sequelize.col("meme.s3Link"), "s3Link"],
			[db.Sequelize.col("meme.views"), "views"],
			[db.Sequelize.col("meme.user.img"), "userImg"],
			[db.Sequelize.col("meme.user.img"), "userName"],
			[db.Sequelize.col("meme.user.username"), "userUsername"]
		],
		include: [
			{
				model: Meme,
				attributes: [],
				as: "meme",
				required: true,
				where: memeWhere,
				include: [
					{
						model: User,
						attributes: [],
						as: "user",
						required: true
					}
				]
			}
		],
		where,
		offset: page * limit,
		limit,
		group: ["meme.id"],
		order: [["id", "DESC"]],
		raw: true
	})
		.then((memes) => {
			const hasMore = memes.length === limit
			return res.status(200).send({
				error: false,
				hasMore,
				memes,
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

exports.findOne = async (req, res) => {
	const { id } = req.params

	MemeTemplate.findAll({
		include: [
			{
				model: Meme,
				as: "meme",
				required: true,
				include: [
					{
						model: User,
						as: "user",
						required: true,
						mapToModel: true,
						attributes: [["img", "userImg"], ["name", "userName"], "username"]
					}
				]
			},
			{
				model: Template,
				as: "template",
				attributes: [
					["name", "templateName"],
					["s3Link", "templateSrc"]
				],
				required: true
			},
			{
				model: TemplateText,
				as: "text",
				required: true,
				mapToModel: true
			}
		],
		where: {
			memeId: id
		},
		order: [["id", "ASC"]],
		raw: true
	})
		.then((memes) => {
			if (memes.length === 0) {
				return res.status(404).send({
					error: true,
					msg: "That meme does not exist"
				})
			}

			const firstRow = memes[0]
			const meme = {
				caption: firstRow["meme.caption"],
				createdAt: firstRow["meme.createdAt"],
				id: firstRow["meme.id"],
				img: `https://brandywine22.s3-us-west-2.amazonaws.com/${
					firstRow["meme.s3Link"] === null ? "" : firstRow["meme.s3Link"]
				}`,
				name: firstRow["meme.name"],
				templates: [],
				user: {
					id: firstRow["meme.user.id"],
					img: `https://brandywine22.s3-us-west-2.amazonaws.com/${firstRow["meme.user.userImg"]}`,
					name: firstRow["meme.user.userName"],
					username: firstRow["meme.user.username"]
				},
				views: firstRow["meme.views"]
			}

			const templateIds = []
			memes.map((_meme, i) => {
				const templateId = _meme.templateId
				const index = templateIds.indexOf(templateId)
				if (index !== -1) {
					meme.templates[index].texts.push({
						advtiveDrags: 0,
						backgroundColor: _meme["text.backgroundColor"],
						color: _meme["text.fontColor"],
						font: _meme["text.fontFamily"],
						size: _meme["text.fontSize"],
						text: _meme["text.text"],
						x: _meme["text.x"],
						y: _meme["text.y"]
					})
				} else {
					templateIds.push(templateId)
					meme.templates.push({
						active: i === 0,
						height: _meme["text.height"],
						img: `https://brandywine22.s3-us-west-2.amazonaws.com/${_meme["template.templateSrc"]}`,
						name: _meme["template.templateName"],
						templateId,
						texts: [
							{
								advtiveDrags: 0,
								backgroundColor: _meme["text.backgroundColor"],
								color: _meme["text.fontColor"],
								font: _meme["text.fontFamily"],
								size: _meme["text.fontSize"],
								text: _meme["text.text"],
								x: _meme["text.x"],
								y: _meme["text.y"]
							}
						],
						width: _meme["text.width"]
					})
				}
			})

			return res.status(200).send({
				error: false,
				meme,
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

exports.updateViews = async (req, res) => {
	const { id } = req.params

	Meme.increment("views", { where: { id } })

	return res.status(200).send({
		error: false,
		msg: "Views updated"
	})
}
