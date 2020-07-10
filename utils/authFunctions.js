/* eslint-disable */
const jwt = require("jsonwebtoken")
/* eslint-enable */
const jwtSecret = "mysuperdupersecret"

module.exports = {
	parseAuthentication: function (req) {
		const token = req.headers.authorization
		let authenticated = true
		let user = {}

		try {
			user = jwt.verify(token, jwtSecret)
		} catch (err) {
			authenticated = false
		}

		return {
			authenticated,
			user
		}
	},
	signToken: function (data) {
		const token = jwt.sign(data, jwtSecret, { expiresIn: 60 * 60 * 336 })
		return token
	}
}
