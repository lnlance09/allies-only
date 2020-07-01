/* eslint-disable */
const interaction = require("../../controllers/interaction.js")

module.exports = async (req, res) => {
	interaction.findOne(req, res)
}
