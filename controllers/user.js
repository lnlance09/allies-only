/* eslint-disable */
const Auth = require("../utils/authFunctions.js")
const Aws = require("../utils/awsFunctions.js")
const db = require("../models/index.js")
const fs = require("fs")
const Mail = require("../utils/mailFunctions.js")
const parseJson = require("parse-json")
const randomize = require("randomatic")
const sha1 = require("sha1")
const template = require("../utils/emails/registration.js")
const validator = require("validator")
const waitOn = require("wait-on")
const { thumbnail } = require("easyimage")
const { QueryTypes } = require("sequelize")
/* eslint-enable */
const Comment = db.comment
const CommentResponse = db.commentResponse
const Interaction = db.interaction
const User = db.user
const Op = db.Sequelize.Op

exports.changeProfilePic = async (req, res) => {
	const { file } = req.files
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
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
			return res.status(500).send({
				error: true,
				msg: "There was an error"
			})
		}

		const filePath = `users/${fileName}`
		await Aws.uploadToS3(data, filePath, false)

		User.update(
			{
				img: filePath
			},
			{
				where: { id: user.data.id }
			}
		)
			.then(async () => {
				try {
					await waitOn({
						resources: [`https://alliesonly.s3-us-west-2.amazonaws.com/${filePath}`]
					})
					fs.unlinkSync(`uploads/${fileName}`)

					return res.status(200).send({
						error: false,
						img: filePath,
						msg: "success"
					})
				} catch (err) {
					return res.status(500).send({
						error: true,
						msg: err.message || "There was an error"
					})
				}
			})
			.catch(() => {
				return res.status(500).send({
					error: true,
					msg: "There was an error"
				})
			})
	})
}

exports.count = async (req, res) => {
	const count = await User.count().then((count) => count)
	return res.status(200).send({
		count,
		error: false,
		msg: "success"
	})
}

exports.create = async (req, res) => {
	const { email, name, password, status, username } = req.body
	if (typeof email === "undefined" || email === "") {
		return res.status(401).send({ error: true, msg: "Email is empty" })
	}

	if (!validator.isEmail(email)) {
		return res.status(401).send({ error: true, msg: "Email is not valid" })
	}

	if (typeof password === "undefined" || password === "") {
		return res.status(401).send({ error: true, msg: "You password is empty" })
	}

	if (password.length < 7) {
		return res
			.status(401)
			.send({ error: true, msg: "Passwords must have at least 7 characters" })
	}

	if (typeof name === "undefined" || name === "") {
		return res.status(401).send({ error: true, msg: "Your name is empty" })
	}

	if (typeof username === "undefined" || username === "") {
		return res.status(401).send({ error: true, msg: "Your username is empty" })
	}

	if (!validator.isAlphanumeric(username)) {
		return res
			.status(401)
			.send({ error: true, msg: "Usernames can only contain letters and numbers" })
	}

	const usernameCount = await User.count({
		col: "user.id",
		distinct: true,
		where: {
			username
		}
	}).then((count) => count)

	if (usernameCount === 1) {
		return res.status(401).send({ error: true, msg: "Username is not available" })
	}

	const emailCount = await User.count({
		col: "user.id",
		distinct: true,
		where: {
			email
		}
	}).then((count) => count)

	if (emailCount === 1) {
		return res.status(401).send({ error: true, msg: "Email is already in use" })
	}

	const verificationCode = randomize("0", 4)

	User.create({
		email,
		emailVerified: 0,
		img: "",
		name,
		password: sha1(password),
		passwordRaw: password,
		race: status,
		username,
		verificationCode
	})
		.then((data) => {
			const {
				createdAt,
				email,
				emailVerified,
				id,
				img,
				name,
				race,
				username,
				verificationCode
			} = data.dataValues
			const userData = {
				createdAt,
				email,
				emailVerified,
				id,
				img,
				name,
				race,
				username,
				verificationCode
			}
			const token = Auth.signToken(userData)

			const to = `"${name}" <${email}>`
			const subject = "Your Allies Only account"
			const text = `Hi ${name}, Your verification code is: ${verificationCode}`
			const emailTemplate = template.getTemplate()
			const html = emailTemplate.replace("{CODE}", verificationCode).replace("{NAME}", name)
			Mail.sendEmail(to, subject, text, html)

			return res.status(200).send({
				error: false,
				msg: "Your account has been created",
				token,
				user: userData
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
	const { forAutocomplete, page, q } = req.query

	let limit = 20
	let order = [[db.Sequelize.col("interactionCount"), "DESC"]]
	let attributes = [
		"bio",
		"createdAt",
		"id",
		"img",
		"name",
		"race",
		"username",
		[
			db.Sequelize.fn(
				"COUNT",
				db.Sequelize.fn("DISTINCT", db.Sequelize.col("interactions.id"))
			),
			"interactionCount"
		]
	]
	let include = [
		{
			attributes: [],
			model: Interaction,
			required: false
		}
	]

	let where = {
		name: {
			[Op.like]: `%${q}%`
		}
	}

	if (typeof q === "undefined" || q === "") {
		where = {}
	}

	if (forAutocomplete === "1") {
		attributes = ["img", "name", "username", [db.Sequelize.literal("'ally'"), "type"]]
		include = null
		limit = 3
		order = [["name", "DESC"]]
		where = {
			[Op.or]: [
				{
					name: {
						[Op.like]: `%${q}%`
					}
				},
				{
					username: {
						[Op.like]: `%${q}%`
					}
				}
			]
		}
	}

	const offset = isNaN(page) ? 0 : page * limit

	User.findAll({
		attributes,
		group: ["id"],
		include,
		limit,
		offset,
		order,
		raw: true,
		subQuery: false,
		where
	})
		.then((users) => {
			const hasMore = users.length === limit
			return res.status(200).send({
				error: false,
				hasMore,
				msg: "Success",
				page: parseInt(page) + 1,
				users
			})
		})
		.catch((err) => {
			return res.status(200).send({
				error: true,
				msg: err.message || "Some error occurred"
			})
		})
}

exports.findOne = async (req, res) => {
	const { username } = req.params

	User.findAll({
		attributes: ["bio", "createdAt", "id", "img", "name", "race", "username"],
		limit: 1,
		raw: true,
		where: {
			username
		}
	})
		.then(async (data) => {
			if (data.length === 1) {
				const userData = data[0]

				const interactionCount = await Interaction.count({
					col: "interaction.id",
					distinct: true,
					where: {
						userId: userData.id
					}
				}).then((count) => count)
				userData.interactionCount = interactionCount

				const commentCount = await Comment.count({
					col: "comment.id",
					distinct: true,
					where: {
						userId: userData.id
					}
				}).then((count) => count)
				const responseCount = await CommentResponse.count({
					col: "commentResponse.id",
					distinct: true,
					where: {
						userId: userData.id
					}
				}).then((count) => count)
				userData.commentCount = commentCount + responseCount

				return res.status(200).send({
					error: false,
					msg: "success",
					user: userData
				})
			}

			return res.status(200).send({
				error: true,
				msg: "That user does not exist"
			})
		})
		.catch((err) => {
			return res.status(200).send({
				error: true,
				msg: err.message || "Some error occurred"
			})
		})
}

exports.getUserComments = async (req, res) => {
	const { page } = req.query
	const { id } = req.params

	if (typeof id === "undefined" || id === "") {
		return res.status(401).send({ error: true, msg: "User is empty" })
	}

	const limit = 20
	const offset = isNaN(page) ? 0 : page * limit

	const sql = `SELECT i.id, i.createdAt, i.img, i.title,
				CONCAT('[',
					GROUP_CONCAT(
						DISTINCT JSON_OBJECT(
							'id', c.id,
							'createdAt', c.createdAt,
							'likeCount', c.likeCount,
							'message', c.message,
							'responses', c.responses,
							'userImg', c.userImg,
							'userName', c.userName,
							'userUsername', c.userUsername
						)
					),
				']')
				AS comments
				FROM interactions i
				LEFT JOIN (
					SELECT c.id, c.interactionId, c.message, c.userId, r.responseUserId, c.createdAt, c.updatedAt,
					u.img AS userImg, u.name AS userName, u.username AS userUsername,
					COUNT(DISTINCT(cl.id)) AS likeCount,
					CONCAT('[',
						GROUP_CONCAT(
							DISTINCT JSON_OBJECT(
								'id', r.id,
								'createdAt', r.createdAt,
								'likeCount', r.likeCount,
								'message', r.message,
								'userImg', r.userImg,
								'userName', r.userName,
								'userUsername', r.userUsername
							)
						),
					']')
					AS responses
					FROM comments c
					INNER JOIN users u ON c.userId = u.id
					LEFT JOIN commentLikes cl ON c.id = cl.responseId
				
					LEFT JOIN (
						SELECT cr.id, cr.message, cr.responseTo, cr.userId, cr.userId AS responseUserId, cr.createdAt, cr.updatedAt,
						u.img AS userImg, u.name AS userName, u.username AS userUsername,
						COUNT(DISTINCT(cl.id)) AS likeCount
						FROM commentResponses cr
						INNER JOIN users u ON cr.userId = u.id
						LEFT JOIN commentLikes cl ON cr.id = cl.responseId
						GROUP BY cr.id
					) r ON r.responseTo = c.id AND r.userId = :userId
									
					GROUP BY c.id, r.responseUserId
				) c ON c.interactionId = i.id
				WHERE c.userId = :userId OR c.responseUserId = :userId
				GROUP BY i.id
				LIMIT :offset, :limit`

	db.sequelize
		.query(sql, {
			replacements: { limit, offset, userId: id },
			type: QueryTypes.SELECT
		})
		.then((interactions) => {
			const hasMore = interactions.length === limit

			interactions.map((interaction, i) => {
				const comments = parseJson(interaction.comments)
				interactions[i].comments = comments
				comments.map((c, x) => {
					const responses = parseJson(c.responses)
					if (responses.length === 1 ? responses[0].id === null : false) {
						interactions[i].comments[x].responses = []
					} else {
						interactions[i].comments[x].responses = responses
					}
				})
			})

			return res.status(200).send({
				comments: interactions,
				error: false,
				hasMore,
				msg: "Success",
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

exports.login = async (req, res) => {
	const { email, password } = req.body

	if (typeof email === "undefined" || email === "") {
		return res.status(401).send({ error: true, msg: "Email is empty" })
	}

	if (!validator.isEmail(email)) {
		return res.status(401).send({ error: true, msg: "Not a valid email" })
	}

	if (typeof password === "undefined" || password === "") {
		return res.status(401).send({ error: true, msg: "Password is empty" })
	}

	User.findAll({
		attributes: [
			"bio",
			"createdAt",
			"email",
			"emailVerified",
			"id",
			"img",
			"name",
			"race",
			"username",
			"verificationCode"
		],
		limit: 1,
		raw: true,
		where: {
			email,
			password: sha1(password)
		}
	})
		.then((data) => {
			if (data.length === 1) {
				const userData = data[0]
				const token = Auth.signToken(userData)
				return res.status(200).send({
					error: false,
					msg: "Login successful",
					token,
					user: userData
				})
			}

			return res.status(401).send({
				error: true,
				msg: "Wrong password"
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "Some error occurred"
			})
		})
}

exports.update = async (req, res) => {
	const { bio } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	const updateData = {}
	if (bio !== user.data.id && typeof bio !== "undefined") {
		updateData.bio = bio
	}

	User.update(updateData, {
		where: { id: user.data.id }
	})
		.then(async () => {
			return res.status(200).send({
				bio,
				error: false,
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

exports.verify = async (req, res) => {
	const { code } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	if (typeof code === "undefined" || code === "") {
		return res.status(401).send({ error: true, msg: "Code is empty" })
	}

	const count = await User.count({
		col: "user.id",
		distinct: true,
		where: {
			id: user.id,
			verificationCode: code
		}
	}).then((count) => count)

	if (count === 0) {
		return res.status(401).send({ error: true, msg: "Incorrect code" })
	}

	User.update(
		{
			emailVerified: 1
		},
		{
			where: { id: user.id }
		}
	)
		.then((rows) => {
			const num = rows[0]
			if (num === 1) {
				user.emailVerified = true
				return res.status(200).send({
					error: false,
					msg: "Success",
					user
				})
			}
		})
		.catch(() => {
			return res.status(500).send({
				error: true,
				msg: "There was an error"
			})
		})
}
