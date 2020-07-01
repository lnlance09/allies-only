/* eslint-disable */
const department = require("../../controllers/department.js")

module.exports = async (req, res) => {
	department.findAll(req, res)
}
