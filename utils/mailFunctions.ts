/* eslint-disable */
const nodemailer = require("nodemailer")
/* eslint-enable */

module.exports = {
	sendEmail: async function (to, subject, text, html) {
		const testAccount = await nodemailer.createTestAccount()
		const transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: testAccount.user,
				pass: testAccount.pass
			}
		})

		const info = await transporter.sendMail({
			from: '"Fred Foo 👻" <foo@example.com>',
			to,
			subject,
			text,
			html
		})

		console.log("info", info)
	}
}
