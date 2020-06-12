/* eslint-disable */
const db = require("../models/index.ts")
const { SitemapStream, streamToPromise } = require("sitemap")
const { createGzip } = require("zlib")
/* eslint-enable */
const Meme = db.meme
const Template = db.template
const User = db.user

exports.sitemap = async (req, res) => {
	res.header("Content-Type", "application/xml")
	res.header("Content-Encoding", "gzip")

	try {
		const smStream = new SitemapStream({ hostname: "https://brandy.io/" })
		const pipeline = smStream.pipe(createGzip())

		const memes = await Meme.findAll({
			model: Meme,
			attributes: ["id"],
			raw: true
		})
			.then((memes) => memes)
			.catch(() => [])

		const templates = await Template.findAll({
			model: Template,
			attributes: ["id"],
			raw: true
		})
			.then((templates) => templates)
			.catch(() => [])

		const users = await User.findAll({
			model: User,
			attributes: ["username"],
			raw: true
		})
			.then((users) => users)
			.catch(() => [])

		smStream.write({ url: "/create", changefreq: "monthly", priority: 1.0 })

		memes.map((meme) => {
			smStream.write({ url: `/meme/${meme.id}`, changefreq: "daily", priority: 0.9 })
		})

		templates.map((template) => {
			smStream.write({ url: `/template/${template.id}`, changefreq: "daily", priority: 0.8 })
		})

		smStream.write({ url: "/explore/memes", changefreq: "monthly", priority: 0.7 })
		smStream.write({ url: "/explore/templates", changefreq: "monthly", priority: 0.7 })
		smStream.write({ url: "/explore/artists", changefreq: "monthly", priority: 0.7 })
		smStream.write({ url: "/", changefreq: "monthly", priority: 0.5 })

		users.map((user) => {
			smStream.write({ url: `/artist/${user.username}`, changefreq: "daily", priority: 0.4 })
		})

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
