/* eslint-disable */
const db = require("../models/index.js")
const faker = require("faker")
const Names = require("../utils/nameFunctions.js")
const rn = require("random-number")
const sha1 = require("sha1")
/* eslint-enable */
const Comment = db.comment
const CommentLike = db.commentLike
const CommentResponse = db.commentResponse
const User = db.user

exports.createUsers = async (req, res) => {
	const { amount, politicalStatus } = req.body

	faker.locale = "en_US"
	const password = "ivankatrump94"
	const politicalLabel = politicalStatus === 1 ? "liberal" : "conservative"
	const politicalStatuses = [1, 2]

	if (!politicalStatuses.includes(politicalStatus)) {
		return res.status(500).send({
			error: true,
			msg: "That is not a valid political status"
		})
	}

	const pics = [
		"blue-lives-matter-1.jpg",
		"blue-lives-matter-2.jpg",
		"blue-lives-matter-3.jpg",
		"blue-lives-matter-4.jpg",
		"blue-lives-matter-5.jpg",
		"blue-lives-matter-6.jpg",
		"punisher.jpg",
		"punisher-1.jpg",
		"socialism-sucks.png"
	]

	const gen = rn.generator({
		min: 1984,
		max: 2005,
		integer: true
	})

	for (let i = 0; i < amount; i++) {
		// const image = faker.image.avatar()
		// console.log("image", image)
		const random = Math.floor(Math.random() * 10) + 1
		const email = faker.internet.email()
		const firstName = Names.getFirstName()
		const lastName = Names.getLastName()
		const name = `${firstName} ${lastName}`
		const status = random > 8 ? 1 : 2

		const names = name.split(" ")
		const year = `${gen()}`
		const username = `${names.join("").replace(/[^\w\s]/gi, "")}${year.substring(2)}`

		let img = ""
		if (politicalStatus === 2) {
			img = `users/${pics[Math.floor(Math.random() * pics.length)]}`
		}

		const userData = {
			email,
			emailVerified: 1,
			img,
			name,
			password: sha1(password),
			passwordRaw: password,
			politicalStatus,
			race: status,
			username
		}

		// console.log(userData)
		User.create(userData)
			.then(() => {
				console.log(`User ${name}, ${email} created!`)
			})
			.catch((err) => {
				console.log(`Error: ${err.message}`)
			})
	}

	return res.status(200).send({
		error: false,
		msg: `${amount} ${politicalLabel} accounts created`
	})
}

exports.likeComment = async (req, res) => {
	const { amount, commentId, politicalStatus, responseId } = req.body

	if (typeof responseId !== "undefined" && responseId !== "") {
		const count = await CommentResponse.count({
			col: "commentResponse.id",
			distinct: true,
			where: {
				id: responseId
			}
		}).then((count) => count)

		if (count === 0) {
			return res.status(500).send({
				error: true,
				msg: "That comment response does not exists"
			})
		}
	} else {
		const count = await Comment.count({
			col: "comment.id",
			distinct: true,
			where: {
				id: commentId
			}
		}).then((count) => count)

		if (count === 0) {
			return res.status(500).send({
				error: true,
				msg: "That comment does not exists"
			})
		}
	}

	User.findAll({
		attributes: ["id"],
		limit: amount,
		order: [[db.Sequelize.fn("RAND", "")]],
		raw: true,
		subQuery: false,
		where: {
			politicalStatus
		}
	})
		.then(async (users) => {
			await users.map(async (user) => {
				const where = {
					commentId,
					userId: user.id
				}

				if (typeof responseId !== "undefined" && responseId !== "") {
					where.commentId = null
					where.responseId = responseId
				}

				const count = await CommentLike.count({
					col: "commentLike.id",
					distinct: true,
					where
				}).then((count) => count)

				if (count === 0) {
					await CommentLike.create(where)
				}
			})

			return res.status(200).send({
				error: false,
				msg: "Success"
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "Some error occurred"
			})
		})
}
