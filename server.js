/* eslint-disable */
const express = require("express")
const next = require("next")
const bodyParser = require("body-parser")
const fileupload = require("express-fileupload")
const fs = require("fs")
const https = require("https")
const db = require("./models/index.js")
const comments = require("./controllers/comment.js")
const contact = require("./controllers/contact.js")
const departments = require("./controllers/department.js")
const locations = require("./controllers/location.js")
const interactions = require("./controllers/interaction.js")
const officers = require("./controllers/officer.js")
const sitemap = require("./controllers/sitemap.js")
const users = require("./controllers/user.js")
/* eslint-enable */

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
	key: fs.readFileSync("./certificates/alliesonly.key"),
	cert: fs.readFileSync("./certificates/alliesonly.crt")
}

app.prepare().then(() => {
	const server = express()
	server.use(fileupload())
	server.use(bodyParser.json({ limit: "250mb" }))
	server.use(bodyParser.urlencoded({ extended: true, limit: "250mb" }))
	db.sequelize.sync()

	// Comments
	server.post("/api/comment/create", comments.create)
	server.post("/api/comment/like", comments.like)
	server.get("/api/comment/search", comments.findAll)
	server.post("/api/comment/unlike", comments.unlike)
	server.post("/api/comment/update", comments.update)
	server.post("/api/comment/:id/delete", comments.delete)

	// Contact
	server.post("/api/contact/send", contact.send)

	// Departments
	server.post("/api/department/create", departments.create)
	server.get("/api/department/search", departments.findAll)
	server.get("/api/department/:id", departments.findOne)
	server.post("/api/department/:id/update", departments.update)

	// Interactions
	server.post("/api/interaction/create", interactions.create)
	server.get("/api/interaction/search", interactions.findAll)
	server.get("/api/interaction/:id", interactions.findOne)
	server.post("/api/interaction/saveVideo", interactions.saveVideo)
	server.post("/api/interaction/:id/update", interactions.update)
	server.post("/api/interaction/:id/updateViews", interactions.updateViews)
	server.post("/api/interaction/uploadVideo", interactions.uploadVideo)

	// Locations
	server.get("/api/location/search", locations.findAll)

	// Officers
	server.post("/api/officer/create", officers.create)
	server.get("/api/officer/search", officers.findAll)
	server.get("/api/officer/:id", officers.findOne)
	server.post("/api/officer/:id/update", officers.update)
	server.post("/api/officer/:id/updateImg", officers.updateImg)

	// Users
	server.post("/api/user/changeProfilePic", users.changeProfilePic)
	server.get("/api/user/count", users.count)
	server.post("/api/user/create", users.create)
	server.post("/api/user/login", users.login)
	server.get("/api/user/search", users.findAll)
	server.post("/api/user/update", users.update)
	server.post("/api/user/verify", users.verify)
	server.get("/api/user/:username", users.findOne)
	server.get("/api/user/:id/comments", users.getUserComments)

	// Sitemap
	server.get("/sitemap.xml", sitemap.sitemap)

	server.all("*", (req, res) => {
		return handle(req, res)
	})

	/*
	server.listen(port, (err) => {
		if (err) {
			throw err
		}
		console.log(`> Ready on http://localhost:${port}`)
	})
	*/

	https.createServer(httpsOptions, server).listen(port, (err) => {
		if (err) {
			throw err
		}
		console.log(`> Ready on https://localhost:${port}`)
	})
})
