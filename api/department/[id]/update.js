/* eslint-disable */
const department = require("../../controllers/department.js")

module.exports = async (req, res) => {
	department.update(req, res)
}
