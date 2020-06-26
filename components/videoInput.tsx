import { Form, Icon, Input, Segment } from "semantic-ui-react"
import { toast } from "react-toastify"
import { getConfig } from "@options/toast"
import axios from "axios"
import parse from "url-parse"
import PropTypes from "prop-types"
import queryString from "query-string"
import React, { useState } from "react"

const toastConfig = getConfig()
toast.configure(toastConfig)

const VideoInput: React.FunctionComponent = ({ onPasteInstagram, onPasteYouTube, setLoading }) => {
	const [youtubeUrl, setYoutubeUrl] = useState("")
	const [instagramUrl, setInstagramUrl] = useState("")

	const onKeyUpInstagram = (e) => {
		if (e.keyCode === 8) {
			setInstagramUrl("")
		}
	}

	const onKeyUpYouTube = (e) => {
		if (e.keyCode === 8) {
			setYoutubeUrl("")
		}
	}

	const _onPasteInstagram = async (e) => {
		const value = e.clipboardData.getData("Text")
		const parsed = parse(value)
		if (parsed.hostname !== "www.instagram.com") {
			return false
		}

		const paths = parsed.pathname.split("/")
		paths.shift()

		if (paths.length < 2) {
			return false
		}

		if (paths[0] !== "p") {
			return false
		}

		setInstagramUrl(value)
		setYoutubeUrl("")
		setLoading(true)

		const id = paths[1]
		const videoInfo = await fetchVideo(id, "instagram")
		const { thumbnail, video } = videoInfo
		if (videoInfo) {
			onPasteInstagram({ thumbnail, video })
		}

		setLoading(false)
	}

	const _onPasteYouTube = async (e) => {
		const value = e.clipboardData.getData("Text")
		const parsed = parse(value)
		if (parsed.hostname !== "www.youtube.com") {
			return false
		}

		const qs = queryString.parse(parsed.query)
		if (typeof qs.v === "undefined") {
			return false
		}

		setYoutubeUrl(value)
		setInstagramUrl("")
		setLoading(true)

		const videoInfo = await fetchVideo(qs.v, "youtube")
		const { thumbnail, video } = videoInfo
		if (videoInfo) {
			onPasteYouTube({ thumbnail, video })
		}

		setLoading(false)
	}

	const fetchVideo = async (id: string, type: string) => {
		return await axios
			.post("/api/interaction/saveVideo", {
				id,
				type
			})
			.then((response) => {
				const { thumbnail, video } = response.data
				return {
					thumbnail,
					video
				}
			})
			.catch((error) => {
				toast.error(error.response.data.msg)
			})
	}

	return (
		<Form as={Segment} basic className="videoInputSegment" inverted>
			<Form.Field>
				<Input
					className="red"
					icon={<Icon color="red" name="youtube" inverted />}
					iconPosition="left"
					onKeyUp={onKeyUpYouTube}
					onPaste={_onPasteYouTube}
					placeholder="Paste a link to a YouTube video"
					size="big"
					value={youtubeUrl}
				/>
			</Form.Field>
			<Form.Field>
				<Input
					className="red"
					icon={<Icon color="blue" name="instagram" inverted />}
					iconPosition="left"
					onKeyUp={onKeyUpInstagram}
					onPaste={_onPasteInstagram}
					placeholder="Paste a link to an Instagram video"
					size="big"
					value={instagramUrl}
				/>
			</Form.Field>
		</Form>
	)
}

VideoInput.propTypes = {
	onPasteInstagram: PropTypes.func.isRequired,
	onPasteYouTube: PropTypes.func.isRequired,
	setLoading: PropTypes.func.isRequired
}

VideoInput.defaultProps = {}

export default VideoInput
