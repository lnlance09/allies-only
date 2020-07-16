/* eslint-disable */
const Auth = require("../utils/authFunctions.js")
const Aws = require("../utils/awsFunctions.js")
const db = require("../models/index.js")
const ffmpeg = require("fluent-ffmpeg")
const fs = require("fs")
const isJSON = require("is-json")
const path = require("path")
const randomize = require("randomatic")
const save = require("instagram-save")
const slugify = require("slugify")
const waitOn = require("wait-on")
const youtubedl = require("youtube-dl")
/* eslint-enable */
const Comment = db.comment
const CommentResponse = db.commentResponse
const Department = db.department
const Interaction = db.interaction
const Officer = db.officer
const OfficerInteraction = db.officerInteraction
const User = db.user
const Op = db.Sequelize.Op

exports.create = async (req, res) => {
	const { department, description, file, officer, thumbnail, title } = req.body
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
		img: thumbnail,
		title,
		userId: authenticated ? user.data.id : 1,
		video: file,
		views: 1
	})
		.then(async (data) => {
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
	const { departmentId, exclude, forAutocomplete, officerId, page, q, userId } = req.query

	let limit = 20
	let order = [["createdAt", "DESC"]]
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
	let attributes = [
		[db.Sequelize.col("interaction.createdAt"), "createdAt"],
		[db.Sequelize.col("interaction.description"), "description"],
		[db.Sequelize.col("interaction.id"), "id"],
		[db.Sequelize.col("interaction.img"), "img"],
		[db.Sequelize.col("interaction.title"), "title"],
		[db.Sequelize.col("interaction.updatedAt"), "updatedAt"],
		[db.Sequelize.col("interaction.video"), "video"],
		[db.Sequelize.col("interaction.views"), "views"],
		[db.Sequelize.col("department.img"), "departmentImg"],
		[db.Sequelize.col("department.name"), "departmentName"],
		[db.Sequelize.col("department.slug"), "departmentSlug"],
		[db.Sequelize.col("officerInteractions.officerId"), "officerId"],
		[db.Sequelize.col("officerInteractions->officers.firstName"), "officerFirstName"],
		[db.Sequelize.col("officerInteractions->officers.id"), "officerId"],
		[db.Sequelize.col("officerInteractions->officers.img"), "officerImg"],
		[db.Sequelize.col("officerInteractions->officers.lastName"), "officerLastName"],
		[
			db.Sequelize.fn("COUNT", db.Sequelize.fn("DISTINCT", db.Sequelize.col("comments.id"))),
			"commentCount"
		],
		[
			db.Sequelize.fn(
				"COUNT",
				db.Sequelize.fn("DISTINCT", db.Sequelize.col("officerInteractions.officerId"))
			),
			"officerCount"
		],
		[
			db.Sequelize.fn(
				"COUNT",
				db.Sequelize.fn("DISTINCT", db.Sequelize.col("comments->commentResponses.id"))
			),
			"responseCount"
		]
	]

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

	if (exclude) {
		where.id = { [Op.notIn]: exclude }
	}

	let include = [
		{
			attributes: [],
			model: Department,
			required: departmentRequired,
			where: departmentWhere
		},
		{
			attributes: ["officerId"],
			include: [
				{
					as: "officers",
					attributes: [],
					model: Officer,
					required: true
				}
			],
			model: OfficerInteraction,
			required: officerRequired,
			where: officerWhere
		},
		{
			attributes: [],
			model: User,
			required: userRequired,
			where: userWhere
		},
		{
			attributes: [],
			include: [
				{
					attributes: [],
					model: CommentResponse,
					required: false
				}
			],
			model: Comment,
			required: false,
			subQuery: false
		}
	]

	if (forAutocomplete === "1") {
		attributes = [
			[db.Sequelize.col("interaction.id"), "id"],
			[db.Sequelize.col("interaction.img"), "img"],
			[db.Sequelize.col("interaction.title"), "name"],
			[db.Sequelize.literal("'interaction'"), "type"]
		]
		include = null
		order = [["views", "ASC"]]
		limit = 3
	}

	const offset = isNaN(page) ? 0 : page * limit

	Interaction.findAll({
		attributes,
		group: ["interaction.id"],
		include,
		limit,
		offset,
		order,
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
				interactions,
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

exports.findOne = (req, res) => {
	const { id } = req.params

	Interaction.findAll({
		attributes: [
			[db.Sequelize.col("interaction.createdAt"), "createdAt"],
			[db.Sequelize.col("interaction.description"), "description"],
			[db.Sequelize.col("interaction.id"), "id"],
			[db.Sequelize.col("interaction.img"), "img"],
			[db.Sequelize.col("interaction.title"), "title"],
			[db.Sequelize.col("interaction.updatedAt"), "updatedAt"],
			[db.Sequelize.col("interaction.video"), "video"],
			[db.Sequelize.col("interaction.views"), "views"],
			[db.Sequelize.col("user.id"), "userId"],
			[db.Sequelize.col("user.img"), "userImg"],
			[db.Sequelize.col("user.name"), "userName"],
			[db.Sequelize.col("user.username"), "username"],
			[db.Sequelize.col("department.id"), "departmentId"],
			[db.Sequelize.col("department.img"), "departmentImg"],
			[db.Sequelize.col("department.name"), "departmentName"],
			[db.Sequelize.col("department.slug"), "departmentSlug"],
			[db.Sequelize.col("officerInteractions->officers.firstName"), "officerFirstName"],
			[db.Sequelize.col("officerInteractions->officers.id"), "officerId"],
			[db.Sequelize.col("officerInteractions->officers.img"), "officerImg"],
			[db.Sequelize.col("officerInteractions->officers.lastName"), "officerLastName"],
			[db.Sequelize.col("officerInteractions->officers.slug"), "officerSlug"],
			[
				db.Sequelize.col("officerInteractions->officers->department.name"),
				"officerDepartmentName"
			]
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
						include: [
							{
								attributes: [],
								model: Department,
								required: true
							}
						],
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
				return res.status(200).send({
					error: true,
					msg: "That interaction does not exist"
				})
			}

			const firstRow = interactions[0]
			const interaction = {
				createdAt: firstRow["createdAt"],
				department: {
					id: firstRow["departmentId"],
					img: firstRow["departmentImg"],
					name: firstRow["departmentName"],
					slug: firstRow["departmentSlug"]
				},
				description: firstRow["description"],
				id: firstRow["id"],
				img: firstRow["img"],
				officers: [],
				title: firstRow["title"],
				user: {
					id: firstRow["userId"],
					img: firstRow["userImg"],
					name: firstRow["userName"],
					username: firstRow["username"]
				},
				video: firstRow["video"],
				views: firstRow["views"],
				updatedAt: firstRow["updatedAt"]
			}

			const officerIds = []
			interactions.map((_interaction) => {
				const { officerId } = _interaction
				const exists = officerIds.includes(officerId)

				if (!exists && officerId !== null) {
					officerIds.push(officerId)
					interaction.officers.push({
						departmentName: _interaction.officerDepartmentName,
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
			return res.status(200).send({
				error: true,
				msg: err.message || "An error occurred"
			})
		})
}

exports.saveVideo = async (req, res) => {
	const { id, type } = req.body

	const fileName = `${type}-${id}.mp4`
	const filePath = `interactions/${fileName}`
	const exists = await Aws.fileExists(filePath)
	if (exists) {
		return res.status(200).send({
			error: false,
			thumbnail: `thumbnails/${type}-${id}.png`,
			video: filePath
		})
	}

	if (type === "instagram") {
		const video = await save(id, "uploads")
			.then((res) => {
				return res
			})
			.catch((err) => {
				return res.status(500).send({
					error: true,
					msg: err.message || "An error occurred"
				})
			})

		if (video.label !== "video") {
			fs.unlinkSync(video.file)
			return res.status(500).send({
				error: true,
				msg: "Only videos from be used from Instagram",
				video: false
			})
		}

		ffmpeg(video.file)
			.screenshots({
				count: 1,
				filename: `${type}-${id}.png`,
				folder: "thumbnails",
				timemarks: [02]
			})
			.on("error", (err) => {
				return res.status(500).send({
					error: true,
					msg: err.message | "There was en error creating the thumbnail"
				})
			})
			.on("end", async () => {
				fs.readFile(`thumbnails/${type}-${id}.png`, async (err, data) => {
					if (err) {
						return res.status(500).send({
							error: true,
							msg: err.message | "There was en error creating the thumbnail"
						})
					}

					await Aws.uploadToS3(data, `thumbnails/${type}-${id}.png`, false)

					fs.unlinkSync(`thumbnails/${type}-${id}.png`)
					fs.readFile(video.file, async (err, data) => {
						if (err) {
							return res.status(500).send({
								error: true,
								msg: err.message
							})
						}

						await Aws.uploadToS3(data, filePath, false, "video/mp4")
						fs.unlinkSync(video.file)

						await waitOn({
							resources: [
								`https://alliesonly.s3-accelerate.amazonaws.com/${filePath}`
							]
						})
						return res.status(200).send({
							error: false,
							thumbnail: `thumbnails/${type}-${id}.png`,
							video: filePath
						})
					})
				})
			})
	}

	if (type === "youtube") {
		const video = youtubedl(
			`http://www.youtube.com/watch?v=${id}`,
			// Optional arguments passed to youtube-dl.
			["--format=18"]
			// Additional options can be given for calling `child_process.execFile()`.
			// { cwd: __dirname }
		)

		video.on("info", () => {
			console.log("Download started")
			// console.log("filename: " + info._filename)
			// console.log("size: " + info.size)
			// console.log("info", info)
		})

		video.on("error", (err) => {
			return res.status(500).send({
				error: true,
				msg: err || "That link is not valid",
				video: false
			})
		})

		video.pipe(fs.createWriteStream(`uploads/${fileName}`))

		video.on("end", async () => {
			fs.readFile(`uploads/${fileName}`, async (err, data) => {
				if (err) {
					return res.status(500).send({
						error: true,
						msg: err.message
					})
				}

				await Aws.uploadToS3(data, filePath, false, "video/mp4")

				const uploadThumbnail = new Promise((resolve, reject) => {
					ffmpeg(`uploads/${fileName}`)
						.screenshots({
							count: 1,
							filename: `${type}-${id}.png`,
							folder: "thumbnails",
							timemarks: [02]
						})
						.on("error", reject)
						.on("end", resolve)
				})

				uploadThumbnail
					.then(() => {
						fs.readFile(`thumbnails/${type}-${id}.png`, async (err, data) => {
							if (err) {
								return res.status(500).send({
									error: true,
									msg: "There was en error creating the thumbnail"
								})
							}

							await Aws.uploadToS3(data, `thumbnails/${type}-${id}.png`, false)
							fs.unlinkSync(`thumbnails/${type}-${id}.png`)
							fs.unlinkSync(`uploads/${fileName}`)

							await waitOn({
								resources: [
									`https://alliesonly.s3-accelerate.amazonaws.com/${filePath}`
								]
							})
							return res.status(200).send({
								error: false,
								thumbnail: `thumbnails/${type}-${id}.png`,
								video: filePath
							})
						})
					})
					.catch(() => {
						return res.status(500).send({
							error: true,
							msg: "There was en error creating the thumbnail",
							video: false
						})
					})
			})
		})
	}
}

exports.update = async (req, res) => {
	const { id } = req.params
	const { department, description, officer } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	await OfficerInteraction.destroy({
		where: {
			interactionId: id
		}
	})

	if (isJSON(officer)) {
		const officers = JSON.parse(officer)
		await officers.map(async (o) => {
			if (isNaN(o.value)) {
				const names = o.value.split(" ")
				if (names.length !== 2) {
					return res.status(401).send({
						error: true,
						msg: "Officers must have first and last names"
					})
				}

				const firstName = names[0]
				const lastName = names[1]

				await Officer.create({
					createdBy: authenticated ? user.data.id : 1,
					departmentId: department,
					firstName,
					lastName
				}).then(async (data) => {
					const officer = data.dataValues
					const slug = slugify(`${firstName} ${lastName} ${officer.id}`, {
						lower: true,
						replacement: "-",
						strict: true
					})

					await Officer.update(
						{
							slug
						},
						{
							where: { id: officer.id }
						}
					).then(async () => {
						await OfficerInteraction.create({
							interactionId: id,
							officerId: officer.id
						})
					})
				})
			} else {
				await OfficerInteraction.create({
					interactionId: id,
					officerId: o.value
				})
			}
		})

		if (!authenticated) {
			return res.status(200).send({
				error: false,
				msg: "Success"
			})
		}
	}

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	const count = await Interaction.count({
		col: "interaction.id",
		distinct: true,
		where: {
			userId: user.data.id,
			id
		}
	}).then((count) => count)

	if (count === 0) {
		return res
			.status(401)
			.send({ error: true, msg: "You don't have permission to edit this interaction" })
	}

	const updateData = {
		departmentId: department,
		description
	}

	Interaction.update(updateData, {
		silent: typeof description === "undefined",
		where: { id }
	})
		.then(() => {
			return res.status(200).send({
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

exports.updateViews = async (req, res) => {
	const { id } = req.params

	Interaction.update(
		{
			views: db.Sequelize.literal("views + 1")
		},
		{
			silent: true,
			where: {
				id
			}
		}
	)

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
	const _ext = path.extname(file.name).toLowerCase()
	const extensions = [".avi", ".flv", ".m4v", ".mp4", ".mkv", ".mov", ".webm"]

	if (!extensions.includes(_ext)) {
		return res.status(401).send({ error: true, msg: "That is not a video file" })
	}

	const video = file.data
	const timestamp = new Date().getTime()
	const fileId = `${randomize("aa", 24)}-${timestamp}`
	const ext = _ext === ".mov" ? ".mp4" : _ext
	const fileName = `interactions/${fileId}${ext}`

	fs.writeFile(`uploads/${fileId}${_ext}`, video, async (err) => {
		if (err) {
			return res.status(500).send({
				error: true,
				msg: "There was en error creating the thumbnail"
			})
		}

		if (_ext === ".mov") {
			const convertVideo = new Promise((resolve, reject) => {
				ffmpeg(fs.createReadStream(`uploads/${fileId}.mov`))
					// .audioCodec("libfaac")
					// .videoCodec("libx264")
					.format("mp4")
					.save(`uploads/${fileId}${ext}`)
					.on("error", reject)
					.on("end", resolve)
			})
			convertVideo
				.then(async () => {
					await Aws.uploadToS3(video, fileName, false, "video/mp4")

					const createScreenshot = new Promise((resolve, reject) => {
						ffmpeg(`uploads/${fileId}.mov`)
							.screenshots({
								count: 1,
								filename: `${fileId}.png`,
								folder: "thumbnails",
								timemarks: [02]
							})
							.on("error", reject)
							.on("end", resolve)
					})

					createScreenshot
						.then(async () => {
							fs.readFile(`thumbnails/${fileId}.png`, async (err, data) => {
								if (err) {
									return res.status(500).send({
										error: true,
										msg: err.message
									})
								}

								await Aws.uploadToS3(data, `thumbnails/${fileId}.png`, false)
								fs.unlinkSync(`thumbnails/${fileId}.png`)
								fs.unlinkSync(`uploads/${fileId}${ext}`)

								await waitOn({
									resources: [
										`https://alliesonly.s3-accelerate.amazonaws.com/${fileName}`
									]
								})
								return res.status(200).send({
									error: false,
									thumbnail: `thumbnails/${fileId}.png`,
									video: fileName
								})
							})
						})
						.catch(() => {
							return res.status(500).send({
								error: true,
								msg: "There was an error"
							})
						})
				})
				.catch(() => {
					return res.status(500).send({
						error: true,
						msg: "There was an error"
					})
				})
		} else {
			const createScreenshot = new Promise((resolve, reject) => {
				ffmpeg(`uploads/${fileId}${ext}`)
					.screenshots({
						count: 1,
						filename: `${fileId}.png`,
						folder: "thumbnails",
						timemarks: [02]
					})
					.on("error", reject)
					.on("end", resolve)
			})
			createScreenshot
				.then(async () => {
					fs.readFile(`thumbnails/${fileId}.png`, async (err, data) => {
						if (err) {
							return res.status(500).send({
								error: true,
								msg: err.message
							})
						}

						await Aws.uploadToS3(video, fileName, false, "video/mp4")
						await Aws.uploadToS3(data, `thumbnails/${fileId}.png`, false)
						fs.unlinkSync(`thumbnails/${fileId}.png`)
						fs.unlinkSync(`uploads/${fileId}${ext}`)

						await waitOn({
							resources: [
								`https://alliesonly.s3-accelerate.amazonaws.com/${fileName}`
							]
						})
						return res.status(200).send({
							error: false,
							thumbnail: `thumbnails/${fileId}.png`,
							video: fileName
						})
					})
				})
				.catch(() => {
					return res.status(500).send({
						error: true,
						msg: "There was an error"
					})
				})
		}
	})
}
