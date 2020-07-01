/* eslint-disable */
const location = require("../../controllers/location.js")

module.exports = async (req, res) => {
	location.findAll(req, res)
}
