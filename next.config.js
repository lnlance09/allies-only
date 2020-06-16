/* eslint-disable */
const withFonts = require("next-fonts")
const withImages = require("next-images")
/* eslint-enable */

module.exports = withFonts(
	withImages({
		webpack(config) {
			return config
		}
	})
)
