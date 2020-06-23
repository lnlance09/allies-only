/* eslint-disable */
const AWS = require("aws-sdk")
/* eslint-enable */

const s3 = new AWS.S3({
	accessKeyId: "AKIA3KB7ZZF26C4NLY6O",
	secretAccessKey: "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"
})

module.exports = {
	uploadToS3: async function (file, fileName, useBuffer = true, contentType = "image/jpeg") {
		let body = file
		if (useBuffer) {
			const base64 = file.replace(/^data:image\/\w+;base64,/, "")
			body = new Buffer(base64, "base64")
		}

		const params = {
			Body: body,
			Bucket: "alliesonly",
			ContentEncoding: "base64",
			ContentType: contentType,
			Key: fileName
		}

		s3.upload(params, function (err, data) {
			if (err) {
				throw err
			}
			console.log(`File uploaded successfully. ${data.Location}`)
		})
	}
}
