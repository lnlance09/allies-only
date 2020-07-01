/* eslint-disable */
const user = require("../../controllers/user.js")

module.exports = async (req, res) => {
	user.create(req, res)
}
