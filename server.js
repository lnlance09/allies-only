/* eslint-disable */
const express = require("express")
const next = require("next")
const bodyParser = require("body-parser")
const fileupload = require("express-fileupload")
const db = require("./models/index.ts")
const memes = require("./controllers/meme.ts")
const sitemap = require("./controllers/sitemap.ts")
const templates = require("./controllers/template.ts")
const users = require("./controllers/user.ts")
/* eslint-enable */

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
	const server = express()
	server.use(fileupload())
	server.use(bodyParser.json({ limit: "50mb" }))
	server.use(bodyParser.urlencoded({ extended: false }))
	db.sequelize.sync()

	// Memes
	server.post("/api/meme/create", memes.create)
	server.post("/api/meme/delete", memes.delete)
	server.get("/api/meme/search", memes.findAll)
	server.get("/api/meme/:id", memes.findOne)
	server.post("/api/meme/:id/update", memes.update)
	server.post("/api/meme/:id/updateImg", memes.updateImg)
	server.post("/api/meme/:id/updateViews", memes.updateViews)

	// Templates
	server.post("/api/template/create", templates.create)
	server.get("/api/template/search", templates.findAll)
	server.get("/api/template/:id", templates.findOne)
	server.post("/api/template/:id/update", templates.update)

	// Users
	server.post("/api/user/changeProfilePic", users.changeProfilePic)
	server.post("/api/user/create", users.create)
	server.post("/api/user/login", users.login)
	server.get("/api/user/search", users.findAll)
	server.post("/api/user/update", users.update)
	server.post("/api/user/verify", users.verify)
	server.get("/api/user/:username", users.findOne)

	server.get("/sitemap.xml", sitemap.sitemap)

	server.all("*", (req, res) => {
		return handle(req, res)
	})

	server.listen(port, (err) => {
		if (err) {
			throw err
		}
		console.log(`> Ready on http://localhost:${port}`)
	})
})
