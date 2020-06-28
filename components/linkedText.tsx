import Linkify from "linkifyjs/react"
import PropTypes from "prop-types"
import React from "react"

const LinkedText: React.FC = ({ text }: { text: string }) => {
	return <Linkify options={{ target: "_blank" }}>{text}</Linkify>
}

LinkedText.propTypes = {
	text: PropTypes.string
}

export default LinkedText
