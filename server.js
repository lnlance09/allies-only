/* eslint-disable */
const express = require("express")
const next = require("next")
const bodyParser = require("body-parser")
const fileupload = require("express-fileupload")
const db = require("./models/index.ts")
const departments = require("./controllers/department.ts")
const locations = require("./controllers/location.ts")
const interactions = require("./controllers/interaction.ts")
const officers = require("./controllers/officer.ts")
const sitemap = require("./controllers/sitemap.ts")
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

	// Departments
	server.post("/api/department/create", departments.create)
	server.get("/api/department/search", departments.findAll)
	server.get("/api/department/:id", departments.findOne)
	server.post("/api/department/:id/update", departments.update)

	server.get("/api/location/search", locations.findAll)

	// Interactions
	server.post("/api/interaction/create", interactions.create)
	server.get("/api/interaction/search", interactions.findAll)
	server.get("/api/interaction/:id", interactions.findOne)
	server.post("/api/interaction/:id/update", interactions.update)
	server.post("/api/interaction/:id/updateViews", interactions.updateViews)
	server.post("/api/interaction/uploadVideo", interactions.uploadVideo)

	// Officers
	server.post("/api/officer/create", officers.create)
	server.get("/api/officer/search", officers.findAll)
	server.get("/api/officer/:id", officers.findOne)
	server.post("/api/officer/:id/update", officers.update)
	server.post("/api/officer/:id/updateImg", officers.updateImg)

	// Users
	server.post("/api/user/changeProfilePic", users.changeProfilePic)
	server.post("/api/user/create", users.create)
	server.post("/api/user/login", users.login)
	server.get("/api/user/search", users.findAll)
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
