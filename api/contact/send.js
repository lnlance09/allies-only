/* eslint-disable */
const contact = require("../../controllers/contact.js")

module.exports = async (req, res) => {
	contact.send(req, res)
}
