/* eslint-disable */
const officer = require("../../controllers/officer.js")

module.exports = async (req, res) => {
	officer.update(req, res)
}
