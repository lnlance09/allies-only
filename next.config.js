/* eslint-disable */
const withPlugins = require("next-compose-plugins")
const withImages = require("next-images")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
/* eslint-enable */

module.exports = withPlugins([[withImages]], {
	webpack: (config) => {
		if (config.resolve.plugins) {
			config.resolve.plugins.push(new TsconfigPathsPlugin({ configFile: "tsconfig.json" }))
		} else {
			config.resolve.plugins = [new TsconfigPathsPlugin({ configFile: "tsconfig.json" })]
		}

		config.plugins = config.plugins.filter((plugin) => {
			if (plugin.constructor.name === "ForkTsCheckerWebpackPlugin") return false
			return true
		})

		config.resolve.extensions.push(".js", ".ts", ".tsx")
		return config
	}
})
