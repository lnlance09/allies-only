import * as linkify from "linkifyjs"
import { baseUrl } from "@options/config"
import hashtag from "linkifyjs/plugins/hashtag"
import Linkify from "linkifyjs/react"
import PropTypes from "prop-types"
import React from "react"

const LinkedText: React.FunctionComponent = ({ text }) => {
	hashtag(linkify)

	return (
		<Linkify
			options={{
				formatHref: {
					hashtag: (val) => `${baseUrl}explore/memes?q=${val.substr(1)}`
				}
			}}
		>
			{text}
		</Linkify>
	)
}

LinkedText.propTypes = {
	text: PropTypes.string
}

export default LinkedText
