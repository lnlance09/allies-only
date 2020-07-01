/* eslint-disable */
const express = require("express")
const next = require("next")
const bodyParser = require("body-parser")
const fileupload = require("express-fileupload")
const db = require("./models/index.js")
const contact = require("./controllers/contact.js")
const departments = require("./controllers/department.js")
const locations = require("./controllers/location.js")
const interactions = require("./controllers/interaction.js")
const officers = require("./controllers/officer.ts")
const sitemap = require("./controllers/sitemap.js")
const users = require("./controllers/user.js")
/* eslint-enable */

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "test"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
	const server = express()
	server.use(fileupload())
	server.use(bodyParser.json({ limit: "50mb" }))
	server.use(bodyParser.urlencoded({ extended: false }))
	db.sequelize.sync()

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
	server.post("/api/user/verify", users.verify)
	server.get("/api/user/:username", users.findOne)

	// Sitemap
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
