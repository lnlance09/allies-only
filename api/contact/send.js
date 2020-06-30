/* eslint-disable */
const nodemailer = require("nodemailer")

module.exports = async (req, res) => {
	const { msg } = req.body

	if (typeof msg === "undefined" || msg === "") {
		return res.status(401).send({ error: true, msg: "You must include a message" })
	}

	const to = "lnlance09@gmail.com"
	const subject = "Someone has contacted you"
	const text = msg
	const html = msg

	const transporter = nodemailer.createTransport({
		auth: {
			user: "noreply@alliesonly.com",
			pass: "t3hT!Pvs94wt1Wk"
		},
		host: "smtpout.secureserver.net",
		port: 465,
		requireTLS: true,
		secure: true,
		secureConnection: false,
		tls: {
			ciphers: "SSLv3"
		}
	})

	await transporter.sendMail(
		{
			from: '"Allies Only" <noreply@alliesonly.com>',
			to,
			subject,
			text,
			html
		},
		(error) => {
			if (error) {
				return res.status(500).send({
					error: true,
					msg: "There was an error"
				})
			} else {
				return res.status(200).send({
					error: false,
					msg: "You message has been sent"
				})
			}
		}
	)
}
