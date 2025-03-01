/* eslint-disable */
const Mail = require("../utils/mailFunctions.js")

exports.send = async (req, res) => {
	const { msg } = req.body

	if (typeof msg === "undefined" || msg === "") {
		return res.status(401).send({ error: true, msg: "You must include a message" })
	}

	try {
		const to = "lnlance09@gmail.com"
		const subject = "Someone has contacted you"
		const text = msg
		const html = msg
		Mail.sendEmail(to, subject, text, html)

		return res.status(200).send({
			error: false,
			msg: "Message sent!"
		})
	} catch (err) {
		return res.status(500).send({
			error: true,
			msg: "There was an error"
		})
	}
}
