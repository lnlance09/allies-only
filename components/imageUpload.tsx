import { Button, Dimmer, Header, Icon, Image } from "semantic-ui-react"
import Dropzone from "react-dropzone"
import ImagePic from "@public/images/placeholders/placeholder-dark.jpg"
import PropTypes from "prop-types"
import React, { useState } from "react"

const ImageUpload: React.FC = ({
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

	const onDrop = async (files) => {
		if (files.length > 0) {
			callback(bearer, files[0], id)
		}
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
						<Button className="changePicBtn" color="yellow" icon inverted={inverted}>
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
				onMouseEnter={() => setActive(true)}
				onMouseLeave={() => setActive(false)}
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
