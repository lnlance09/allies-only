/* eslint-disable */
const nodemailer = require("nodemailer")
/* eslint-enable */

module.exports = {
	sendEmail: async function (to, subject, text, html) {
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
					console.log("error:", error)
				} else {
					console.log("good")
				}
			}
		)
	}
}
