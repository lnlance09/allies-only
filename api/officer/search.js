/* eslint-disable */
const officer = require("../../controllers/officer.js")

module.exports = async (req, res) => {
	officer.findAll(req, res)
}
