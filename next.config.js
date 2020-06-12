/* eslint-disable */
const withImages = require("next-images")
const withFonts = require("next-fonts")
/* eslint-enable */

module.exports = withFonts(
	withImages({
		webpack(config) {
			return config
		}
	})
)
