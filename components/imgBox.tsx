import { Button, Grid, Input } from "semantic-ui-react"
import { useDropzone } from "react-dropzone"
import PropTypes from "prop-types"
import React, { useCallback } from "react"

const ImgBox: React.FunctionComponent = (props) => {
	const { imgIndex, imgUrl, inverted, onFileUpload, onKeyUp, onPaste } = props

	const onDrop = useCallback((files) => {
		const file = files[0]
		const reader = new FileReader()
		reader.onload = () => {
			const img = reader.result
			onFileUpload(file.path, img, imgIndex)
		}
	}, [])

	const { getRootProps, getInputProps } = useDropzone({ onDrop })

	return (
		<div className="imgBox">
			<Grid columns={2}>
				<Grid.Column style={{ paddingRight: 0 }} width={12}>
					<Input
						fluid
						icon="paperclip"
						inverted={inverted}
						onKeyUp={(e) => onKeyUp(e, imgIndex)}
						onPaste={(e) => onPaste(e, imgIndex)}
						placeholder="Image URL"
						value={imgUrl === "/images/blank.png" ? "" : imgUrl}
					/>
				</Grid.Column>
				<Grid.Column width={4}>
					<div {...getRootProps()}>
						<input {...getInputProps()} />
						<Button color="grey" icon="upload" fluid inverted={inverted} />
					</div>
				</Grid.Column>
			</Grid>
		</div>
	)
}

ImgBox.propTypes = {
	imgUrl: PropTypes.string,
	imgIndex: PropTypes.number,
	inverted: PropTypes.bool,
	onFileUpload: PropTypes.func,
	onKeyUp: PropTypes.func,
	onPaste: PropTypes.func
}

ImgBox.defaultProps = {}

export default ImgBox
