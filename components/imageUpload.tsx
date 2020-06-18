import { Button, Dimmer, Header, Icon, Image } from "semantic-ui-react"
import Dropzone from "react-dropzone"
import ImagePic from "@public/images/placeholders/placeholder-dark.jpg"
import PropTypes from "prop-types"
import React, { useState } from "react"

const ImageUpload: React.FunctionComponent = ({
	bearer,
	callback,
	fluid,
	headerSize,
	id,
	inverted,
	img,
	imgSize,
	msg
}) => {
	const [active, setActive] = useState(false)
	const [files, setFiles] = useState([])

	const onDrop = async (files) => {
		await setFiles(files)
		if (files.length > 0) {
			callback(bearer, files[0], id)
		}
	}

	const toggleDimmer = () => {
		setActive(!active)
	}

	const content = (
		<Dropzone onDrop={onDrop}>
			{({ getRootProps, getInputProps }) => (
				<section>
					<div {...getRootProps()}>
						<input {...getInputProps()} />
						<Header inverted={inverted} size={headerSize}>
							{msg}
						</Header>
						<Button className="changePicBtn" color="blue" icon inverted={inverted}>
							<Icon name="image" />
						</Button>
					</div>
				</section>
			)}
		</Dropzone>
	)

	return (
		<div className="imageUpload">
			<Dimmer.Dimmable
				as={Image}
				dimmed={active}
				dimmer={{ active, content, inverted: false }}
				fluid={fluid}
				onError={(i) => (i.target.src = ImagePic)}
				onMouseEnter={toggleDimmer}
				onMouseLeave={toggleDimmer}
				rounded
				size={fluid ? null : imgSize}
				src={img}
			/>
		</div>
	)
}

ImageUpload.propTypes = {
	bearer: PropTypes.string,
	callback: PropTypes.func,
	fluid: PropTypes.bool,
	headerSize: PropTypes.string,
	id: PropTypes.number,
	img: PropTypes.string,
	inverted: PropTypes.bool,
	imgSize: PropTypes.string,
	msg: PropTypes.string
}

ImageUpload.defaultProps = {
	fluid: false,
	headerSize: "medium",
	img: ImagePic,
	imgSize: "medium",
	inverted: true,
	msg: "Select a picture"
}

export default ImageUpload
