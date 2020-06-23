/* eslint-disable */
const nodemailer = require("nodemailer")
/* eslint-enable */

module.exports = {
	sendEmail: async function (to, subject, text, html) {
		const transporter = nodemailer.createTransport({
			auth: {
				user: "admin@alliesonly.com",
				pass: "/_99[9517tV]9%y"
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
					console.log("error:", error)
				} else {
					console.log("good")
				}
			}
		)
	}
}
