/* eslint-disable */
const Auth = require("../utils/authFunctions.js")
const Aws = require("../utils/awsFunctions.js")
const db = require("../models/index.js")
const fs = require("fs")
const Mail = require("../utils/mailFunctions.js")
const randomize = require("randomatic")
const sha1 = require("sha1")
const template = require("../utils/emails/registration.js")
const { thumbnail } = require("easyimage")
const validator = require("validator")
const waitOn = require("wait-on")
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
						msg: "There was an error"
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
		attributes: ["createdAt", "id", "img", "name", "race", "username"],
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
