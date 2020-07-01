/* eslint-disable */
const db = require("../models/index.js")
/* eslint-enable */
const Location = db.location
const Op = db.Sequelize.Op

exports.findAll = async (req, res) => {
	const { q, state } = req.query

	const limit = 20
	let where = {
		[Op.or]: [
			{
				city: {
					[Op.like]: `%${q}%`
				}
			}
		]
	}

	if (typeof q === "undefined" || q === "") {
		where = {}
	}

	if (typeof state !== "undefined" && state !== "") {
		where.state = state
	}

	Location.findAll({
		attributes: [
			[
				db.Sequelize.fn(
					"concat",
					db.Sequelize.col("city"),
					", ",
					db.Sequelize.col("state")
				),
				"key"
			],
			[
				db.Sequelize.fn(
					"concat",
					db.Sequelize.col("city"),
					", ",
					db.Sequelize.col("state")
				),
				"text"
			],
			[db.Sequelize.col("location.id"), "value"]
		],
		group: ["key"],
		limit,
		order: [
			["city", "ASC"],
			["state", "ASC"]
		],
		raw: true,
		where
	})
		.then((locations) => {
			return res.status(200).send({
				error: false,
				locations,
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
