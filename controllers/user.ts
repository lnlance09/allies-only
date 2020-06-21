/* eslint-disable */
const Auth = require("../utils/authFunctions.ts")
const Aws = require("../utils/awsFunctions.ts")
const db = require("../models/index.ts")
const Mail = require("../utils/mailFunctions.ts")
const randomize = require("randomatic")
const sha1 = require("sha1")
const validator = require("validator")
/* eslint-enable */
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
	const fileName = `users/${randomize("aa", 24)}-${timestamp}.png`
	await Aws.uploadToS3(image, fileName, false)

	setTimeout(() => {
		User.update(
			{
				img: fileName
			},
			{
				where: { id: user.data.id }
			}
		)
			.then(() => {
				return res.status(200).send({
					error: false,
					img: fileName,
					msg: "success"
				})
			})
			.catch(() => {
				return res.status(500).send({
					error: true,
					msg: "There was an error"
				})
			})
	}, 3500)
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
		return res.status(401).send({ error: true, msg: "You must include your email" })
	}

	if (!validator.isEmail(email)) {
		return res.status(401).send({ error: true, msg: "Please provide a valid email" })
	}

	if (typeof password === "undefined" || password === "") {
		return res.status(401).send({ error: true, msg: "You must include your password" })
	}

	if (password.length < 7) {
		return res
			.status(401)
			.send({ error: true, msg: "Your password must be at least 7 characters long" })
	}

	if (typeof name === "undefined" || name === "") {
		return res.status(401).send({ error: true, msg: "You must provide your name" })
	}

	if (typeof username === "undefined" || username === "") {
		return res.status(401).send({ error: true, msg: "You must provide a username" })
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
		return res.status(401).send({ error: true, msg: "That username has been taken" })
	}

	const emailCount = await User.count({
		col: "user.id",
		distinct: true,
		where: {
			email
		}
	}).then((count) => count)

	if (emailCount === 1) {
		return res
			.status(401)
			.send({ error: true, msg: "An account with that email already exists" })
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
	const { page, q } = req.query

	const limit = 20
	const offset = isNaN(page) ? 0 : page * limit
	const order = [[db.Sequelize.col("interactionCount"), "DESC"]]
	let where = {
		name: {
			[Op.like]: `%${q}%`
		}
	}

	if (typeof q === "undefined" || q === "") {
		where = {}
	}

	User.findAll({
		attributes: [
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
		],
		group: ["id"],
		include: [
			{
				attributes: [],
				model: Interaction,
				required: false
			}
		],
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
			return res.status(500).send({
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

				return res.status(200).send({
					error: false,
					msg: "success",
					user: userData
				})
			}

			return res.status(401).send({
				error: true,
				msg: "That user does not exist"
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "Some error occurred"
			})
		})
}

exports.login = async (req, res) => {
	const { email, password } = req.body

	if (typeof email === "undefined" || email === "") {
		return res.status(401).send({ error: true, msg: "You must include your email" })
	}

	if (!validator.isEmail(email)) {
		return res.status(401).send({ error: true, msg: "Please provide a valid email" })
	}

	if (typeof password === "undefined" || password === "") {
		return res.status(401).send({ error: true, msg: "You must include your password" })
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
				Mail.sendEmail(
					"lnlance09@gmail.com",
					"Sample Email",
					"Hello world?",
					"<b>Hello world?</b>"
				)

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
				msg: "Incorrect login credentials"
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
		return res.status(401).send({ error: true, msg: "You must provide a verification code" })
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
		return res.status(401).send({ error: true, msg: "That code is incorrect" })
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
