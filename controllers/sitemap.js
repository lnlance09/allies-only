/* eslint-disable */
const db = require("../models/index.js")
const { SitemapStream, streamToPromise } = require("sitemap")
const { createGzip } = require("zlib")
/* eslint-enable */
const Department = db.department
const Interaction = db.interaction
const Officer = db.officer
const User = db.user

exports.sitemap = async (req, res) => {
	res.header("Content-Type", "application/xml")
	res.header("Content-Encoding", "gzip")

	try {
		const smStream = new SitemapStream({ hostname: "https://alliesonly.com/" })
		const pipeline = smStream.pipe(createGzip())

		// Execute all of the queries
		const departments = await Department.findAll({
			model: Department,
			attributes: ["slug"],
			raw: true
		})
			.then((departments) => departments)
			.catch(() => [])
		const interactions = await Interaction.findAll({
			model: Interaction,
			attributes: ["id"],
			raw: true
		})
			.then((interactions) => interactions)
			.catch(() => [])
		const officers = await Officer.findAll({
			model: Interaction,
			attributes: ["slug"],
			raw: true
		})
			.then((officers) => officers)
			.catch(() => [])
		const users = await User.findAll({
			model: User,
			attributes: ["username"],
			raw: true
		})
			.then((users) => users)
			.catch(() => [])

		// Write all of the links
		interactions.map((interaction) => {
			smStream.write({
				url: `/interactions/${interaction.id}`,
				changefreq: "daily",
				priority: 0.9
			})
		})
		smStream.write({ url: "/interactions", changefreq: "monthly", priority: 0.9 })
		smStream.write({ url: "/interactions/create", changefreq: "monthly", priority: 0.9 })

		officers.map((officer) => {
			smStream.write({ url: `/officers/${officer.slug}`, changefreq: "daily", priority: 0.8 })
		})
		smStream.write({ url: "/officers", changefreq: "monthly", priority: 0.8 })
		smStream.write({ url: "/officers/create", changefreq: "monthly", priority: 0.8 })

		departments.map((department) => {
			smStream.write({
				url: `/departments/${department.slug}`,
				changefreq: "daily",
				priority: 0.6
			})
		})
		smStream.write({ url: "/departments", changefreq: "monthly", priority: 0.6 })
		smStream.write({ url: "/departments/create", changefreq: "monthly", priority: 0.6 })

		users.map((user) => {
			smStream.write({ url: `/${user.username}`, changefreq: "daily", priority: 0.5 })
		})
		smStream.write({ url: "/allies", changefreq: "monthly", priority: 0.5 })

		smStream.write({ url: "/signin", changefreq: "monthly", priority: 0.4 })
		smStream.write({ url: "/signin?type=join", changefreq: "monthly", priority: 0.4 })

		smStream.write({ url: "/about", changefreq: "monthly", priority: 0.4 })
		smStream.write({ url: "/contact", changefreq: "monthly", priority: 0.4 })

		smStream.end()

		streamToPromise(pipeline).then((sm) => (sitemap = sm))
		pipeline.pipe(res).on("error", (e) => {
			throw e
		})
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
