/* eslint-disable */
const Auth = require("../utils/authFunctions.js")
const db = require("../models/index.js")
const { QueryTypes } = require("sequelize")
/* eslint-enable */
const Comment = db.comment
const CommentLike = db.commentLike
const CommentResponse = db.commentResponse
const Interaction = db.interaction

exports.create = async (req, res) => {
	const { interactionId, message, responseTo } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (typeof message === "undefined" || message === "") {
		return res.status(422).send({ error: true, msg: "Comment can't be empty" })
	}

	if (!authenticated) {
		return res.status(422).send({ error: true, msg: "You must be logged in" })
	}

	const interactionCount = await Interaction.count({
		col: "interaction.id",
		distinct: true,
		where: {
			id: interactionId
		}
	}).then((count) => count)

	if (interactionCount === 0) {
		return res.status(500).send({
			error: true,
			msg: "That interaction doesn't exist"
		})
	}

	if (typeof responseTo !== "undefined" && responseTo !== null) {
		const responseCount = await Comment.count({
			col: "comment.id",
			distinct: true,
			where: {
				id: responseTo
			}
		}).then((count) => count)

		if (responseCount === 0) {
			return res.status(500).send({
				error: true,
				msg: "That comment doesn't exist"
			})
		}

		CommentResponse.create({
			message,
			responseTo,
			userId: user.data.id
		})
			.then((data) => {
				const comment = data.dataValues
				comment.likeCount = 0
				comment.likedByMe = 0
				comment.replyCount = 0
				comment.responses = []
				comment.userImg = authenticated ? user.data.img : ""
				comment.userName = authenticated ? user.data.name : "Anonymous"
				comment.userUsername = authenticated ? user.data.username : "anonymous"

				return res.status(200).send({
					comment,
					error: false
				})
			})
			.catch((err) => {
				return res.status(500).send({
					error: true,
					msg: err.message || "An error occurred"
				})
			})
		return
	}

	Comment.create({
		interactionId,
		message,
		userId: user.data.id
	})
		.then((data) => {
			const comment = data.dataValues
			comment.likeCount = 0
			comment.likedByMe = 0
			comment.replyCount = 0
			comment.responses = []
			comment.userImg = authenticated ? user.data.img : ""
			comment.userName = authenticated ? user.data.name : "Anonymous"
			comment.userUsername = authenticated ? user.data.username : "anonymous"

			return res.status(200).send({
				comment,
				error: false
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.delete = async (req, res) => {
	const { id } = req.params
	const { isReply } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(422).send({ error: true, msg: "You must be logged in" })
	}

	if (isReply === 1) {
		const count = await CommentResponse.count({
			col: "comment.id",
			distinct: true,
			where: {
				id,
				userId: user.data.id
			}
		}).then((count) => count)

		if (count === 0) {
			return res.status(500).send({
				error: true,
				msg: "That comment doesn't exist"
			})
		}

		CommentResponse.destroy({
			where: {
				id
			}
		})
			.then(() => {
				return res.status(200).send({
					error: false,
					msg: "Comment successfully deleted"
				})
			})
			.catch((err) => {
				return res.status(500).send({
					error: true,
					msg: err.message || "An error occurred"
				})
			})
	}

	const count = await Comment.count({
		col: "comment.id",
		distinct: true,
		where: {
			id,
			userId: user.data.id
		}
	}).then((count) => count)

	if (count === 0) {
		return res.status(500).send({
			error: true,
			msg: "That comment doesn't exist"
		})
	}

	Comment.destroy({
		where: {
			id
		}
	})
		.then(() => {
			return res.status(200).send({
				error: false,
				msg: "Comment successfully deleted"
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
	const { interactionId, page, userId } = req.query
	const { authenticated, user } = Auth.parseAuthentication(req)

	const hasInteractionId = typeof interactionId !== "undefined" && interactionId !== ""
	const hasUserId = typeof userId !== "undefined" && userId !== ""

	const limit = 20
	const offset = isNaN(page) ? 0 : page * limit

	const sql = `SELECT c.id, c.createdAt, c.interactionId, c.message, c.userId, c.updatedAt,
				u.img AS userImg, u.name AS userName, u.username AS userUsername,
				COUNT(DISTINCT(cl.id)) AS likeCount,
				${authenticated ? ` COUNT(DISTINCT(myCl.id)) AS likedByMe, ` : ""}
				CONCAT('[',
					GROUP_CONCAT(
						DISTINCT JSON_OBJECT(
							'id', r.id,
							'createdAt', r.createdAt,
							'likeCount', r.likeCount,
							${authenticated ? ` 'likedByMe', r.likedByMe,` : ""}
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
				LEFT JOIN commentLikes cl ON c.id = cl.commentId
				${
					authenticated
						? ` LEFT JOIN commentLikes myCl ON c.id = myCl.commentId AND myCl.userId = ${user.data.id} `
						: ""
				}
				LEFT JOIN (
					SELECT cr.id, cr.message, cr.responseTo, cr.userId, cr.createdAt, cr.updatedAt,
					cl.responseId, u.img AS userImg, u.name AS userName, u.username AS userUsername,
					COUNT(DISTINCT(cl.id)) AS likeCount
					${authenticated ? `, COUNT(DISTINCT(myCl.id)) AS likedByMe ` : ""}
					FROM commentResponses cr
					INNER JOIN users u ON cr.userId = u.id
					LEFT JOIN commentLikes cl ON cr.id = cl.responseId
					${
						authenticated
							? ` LEFT JOIN commentLikes myCl ON cr.id = myCl.responseId AND myCl.userId = ${user.data.id} `
							: ""
					}
					GROUP BY cr.id
				) r ON r.responseTo = c.id
				${hasInteractionId ? " WHERE interactionId = :interactionId " : ""}
				${hasInteractionId && hasUserId ? " AND " : !hasInteractionId && hasUserId ? " WHERE " : ""}
				${hasUserId ? " c.userId = :userId OR r.userId = :userId " : ""}
				GROUP BY c.id
				LIMIT :offset, :limit`

	const replacements = { limit, offset }
	if (hasInteractionId) {
		replacements.interactionId = interactionId
	}

	if (hasUserId) {
		replacements.userId = userId
	}

	db.sequelize
		.query(sql, {
			replacements,
			type: QueryTypes.SELECT
		})
		.then((comments) => {
			const hasMore = comments.length === limit

			comments.map((comment) => {
				const { responses } = comment
				let parsed = JSON.parse(responses)

				if (parsed.length === 1 ? parsed[0].id === null : false) {
					comment.responses = []
				} else {
					parsed.sort((a, b) => a.id - b.id)
					comment.responses = parsed
				}
			})

			return res.status(200).send({
				comments: comments,
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

exports.like = async (req, res) => {
	const { commentId, responseId } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(422).send({ error: true, msg: "You must be logged in" })
	}

	let where = {
		userId: user.data.id
	}

	let likeData = {
		commentId,
		userId: user.data.id
	}

	if (typeof commentId !== "undefined" && commentId !== "") {
		where.commentId = commentId
	}

	if (typeof responseId !== "undefined" && responseId !== "") {
		where = {
			responseId,
			userId: user.data.id
		}

		likeData = {
			responseId,
			userId: user.data.id
		}
	}

	if (typeof where.commentId === "undefined" && typeof where.responseId === "undefined") {
		return res.status(500).send({
			error: true,
			msg: "You must include a comment"
		})
	}

	const count = await CommentLike.count({
		col: "commentLike.id",
		distinct: true,
		where
	}).then((count) => count)

	if (count === 1) {
		return res.status(500).send({
			error: true,
			msg: "You already liked this comment"
		})
	}

	CommentLike.create(likeData)
		.then(() => {
			return res.status(200).send({
				error: false,
				msg: "Liked!"
			})
		})
		.catch((err) => {
			return res.status(500).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.unlike = async (req, res) => {
	const { commentId, responseId } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(422).send({ error: true, msg: "You must be logged in" })
	}

	let where = {
		userId: user.data.id
	}

	if (typeof commentId !== "undefined" && commentId !== "") {
		where.commentId = commentId
	}

	if (typeof responseId !== "undefined" && responseId !== "") {
		where = {
			responseId,
			userId: user.data.id
		}
	}

	const count = await CommentLike.count({
		col: "commentLike.id",
		distinct: true,
		where
	}).then((count) => count)

	if (count === 0) {
		return res.status(500).send({
			error: true,
			msg: "You haven't liked this comment"
		})
	}

	CommentLike.destroy({ where })
		.then(() => {
			return res.status(200).send({
				error: false,
				msg: "Unliked"
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
	const { message, isReply } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	if (isReply === 1) {
		const count = await CommentResponse.count({
			col: "comment.id",
			distinct: true,
			where: {
				userId: user.data.id,
				id
			}
		}).then((count) => count)

		if (count === 0) {
			return res
				.status(401)
				.send({ error: true, msg: "You don't have permission to edit this comment" })
		}

		CommentResponse.update(
			{ message },
			{
				where: { id }
			}
		)
			.then(async () => {
				const comment = await Department.findByPk(id, { raw: true })
				return res.status(200).send({
					comment,
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

	const count = await Comment.count({
		col: "comment.id",
		distinct: true,
		where: {
			userId: user.data.id,
			id
		}
	}).then((count) => count)

	if (count === 0) {
		return res
			.status(401)
			.send({ error: true, msg: "You don't have permission to edit this comment" })
	}

	Comment.update(
		{ message },
		{
			where: { id }
		}
	)
		.then(async () => {
			const comment = await Department.findByPk(id, { raw: true })
			return res.status(200).send({
				comment,
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
