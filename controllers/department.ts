/* eslint-disable */
const Auth = require("../utils/authFunctions.ts")
const Aws = require("../utils/awsFunctions.ts")
const db = require("../models/index.ts")
const axios = require("axios")
const slugify = require("slugify")
const UsaStates = require("usa-states").UsaStates
const validator = require("validator")
/* eslint-enable */
const Department = db.department
const Interaction = db.interaction
const Location = db.location
const Officer = db.officer
const Op = db.Sequelize.Op

exports.create = async (req, res) => {
	const { city, name } = req.body

	if (typeof name === "undefined" || name === "") {
		return res.status(422).send({ error: true, msg: "You must provide a name" })
	}

	if (!validator.isAlpha(name)) {
		return res
			.status(401)
			.send({ error: true, msg: "Department names can only contain letters" })
	}

	const location = await Location.findByPk(city, { raw: true })
	if (typeof location === "undefined" || location === null) {
		return res.status(422).send({ error: true, msg: "That is not a valid location" })
	}

	const count = await Department.count({
		col: "department.id",
		distinct: true,
		where: {
			city: location.city,
			state: location.state,
			type: 2
		}
	}).then((count) => count)

	if (count === 1) {
		return res.status(500).send({
			error: true,
			msg: `${location.city} already has a police department`
		})
	}

	Department.create({
		city: location.city,
		county: location.county,
		lat: location.lat,
		lon: location.lon,
		name,
		state: location.state,
		type: 2,
		zipCode: location.zip_code
	})
		.then((data) => {
			const department = data.dataValues
			const slug = slugify(`${name} ${department.id}`, {
				lower: true,
				replacement: "-",
				strict: true
			})

			Department.update(
				{
					slug
				},
				{
					where: { id: department.id }
				}
			).then(() => {
				department.slug = slug
				return res.status(200).send({
					department,
					error: false
				})
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
	const { forAutocomplete, forOptions, id, page, q } = req.query

	let limit = 20
	let order = [[db.Sequelize.col("interactionCount"), "DESC"]]
	let where = {
		name: {
			[Op.like]: `%${q}%`
		}
	}

	if (typeof q === "undefined" || q === "") {
		where = {}
	}

	let attributes = [
		"city",
		"county",
		"id",
		"lat",
		"lon",
		"name",
		"slug",
		"state",
		"type",
		"zipCode",
		[
			db.Sequelize.fn("COUNT", db.Sequelize.fn("DISTINCT", db.Sequelize.col("officers.id"))),
			"officerCount"
		],
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
			model: Officer
		},
		{
			attributes: [],
			model: Interaction
		}
	]

	if (forOptions === "1") {
		attributes = [
			[
				db.Sequelize.fn("concat", db.Sequelize.col("name"), "-", db.Sequelize.col("id")),
				"key"
			],
			["name", "text"],
			["id", "value"]
		]
		include = null
		order = [["name", "ASC"]]

		if (typeof id !== "undefined") {
			where.id = id
		}
	}

	if (forAutocomplete === "1") {
		attributes = [
			"city",
			"id",
			"name",
			"slug",
			"state",
			["type", "departmentType"],
			[db.Sequelize.literal("'department'"), "type"]
		]
		include = null
		order = [["name", "ASC"]]
		limit = 4
	}

	const offset = isNaN(page) ? 0 : page * limit

	Department.findAll({
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
		.then((departments) => {
			const hasMore = departments.length === limit
			return res.status(200).send({
				departments,
				error: false,
				hasMore,
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

	Department.findAll({
		attributes: [
			"city",
			"county",
			"id",
			"lat",
			"lon",
			"name",
			"state",
			"type",
			"zipCode",
			[
				db.Sequelize.fn(
					"COUNT",
					db.Sequelize.fn("DISTINCT", db.Sequelize.col("officers.id"))
				),
				"officerCount"
			],
			[
				db.Sequelize.fn(
					"COUNT",
					db.Sequelize.fn("DISTINCT", db.Sequelize.col("interactions.id"))
				),
				"interactionCount"
			]
		],
		include: [
			{
				attributes: [],
				model: Officer
			},
			{
				attributes: [],
				model: Interaction
			}
		],
		limit: 1,
		raw: true,
		subQuery: false,
		where: {
			slug: id
		}
	})
		.then(async (data) => {
			console.log("data", data)
			if (data.length === 0) {
				return res.status(404).send({
					error: true,
					msg: "That department does not exist"
				})
			}

			const department = data[0]
			if (department.id === null) {
				return res.status(404).send({
					error: true,
					msg: "That department does not exist"
				})
			}

			let where = {
				city: department.city,
				state: department.state
			}

			// State police
			if (department.type === 1) {
				const states = new UsaStates()
				const state = states.states.filter((state) => state.name === department.state)
				where = {
					city: state[0].capital,
					state: department.state
				}
			}

			// County sheriff
			if (department.type === 3) {
				where = {
					county: department.county
				}
			}

			const location = await Location.findAll({
				attributes: ["lat", "lon"],
				limit: 1,
				raw: true,
				where
			}).then((locations) => {
				if (locations.length === 1) {
					return locations[0]
				}

				return false
			})

			department.lat = location ? location.lat : null
			department.lon = location ? location.lon : null

			return res.status(200).send({
				department,
				error: false,
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
	const { name } = req.body
	const { authenticated, user } = Auth.parseAuthentication(req)

	if (!authenticated) {
		return res.status(401).send({ error: true, msg: "You must be logged in" })
	}

	const count = await Department.count({
		col: "department.id",
		distinct: true,
		where: {
			createdBy: user.data.id,
			id
		}
	}).then((count) => count)

	if (count === 0) {
		return res
			.status(401)
			.send({ error: true, msg: "You don't have permission to edit this department" })
	}

	const updateData = {}
	if (typeof name !== "undefined" && name !== "") {
		updateData.name = name
	}

	Department.update(updateData, {
		where: { id }
	})
		.then(async () => {
			const department = await Department.findByPk(id, { raw: true })
			return res.status(200).send({
				error: false,
				msg: "Success",
				department
			})
		})
		.catch(() => {
			return res.status(500).send({
				error: true,
				msg: "There was an error"
			})
		})
}
