import { Image } from "semantic-ui-react"
import BlankImg from "@public/images/blank.png"
import Draggable from "react-draggable"
import PropTypes from "prop-types"
import React, { useState } from "react"

const MemeImages: React.FunctionComponent = ({
	clickImg,
	downloadMeme,
	downloadOnLoad,
	editable,
	handleDrag,
	handleDragStart,
	handleDragStop,
	images,
	isInitialRender,
	setDimensions
}) => {
	const [downloaded, setDownloaded] = useState(false)
	const [height, setHeight] = useState(0)
	const [width, setWidth] = useState(0)

	return (
		<div id="memeContainer">
			{images.map((_img, i) => {
				const { active, img, texts } = _img

				return (
					<div className="draggableWrapper" key={`draggableWrapper${i}`}>
						{texts.map((text, t) => {
							if (width === 0 || height === 0) {
								return
							}

							let { x, y } = text
							let heightRatio = 1
							let widthRatio = 1
							if (!isInitialRender) {
								heightRatio = height / _img.height
								widthRatio = width / _img.width
								y = y * heightRatio
								x = x * widthRatio - (1 - widthRatio) * 16
							}

							if (isNaN(y) || isNaN(x)) {
								return
							}

							const textBlock = (
								<div
									className={`memeText ${editable ? "" : "disabled"}`}
									key={`textBlock${t}${i}`}
									style={{
										backgroundColor: text.backgroundColor,
										color: text.color,
										fontFamily: text.font,
										fontSize: `${Math.ceil(text.size * widthRatio)}px`,
										padding: `${Math.ceil(10 * widthRatio)}px`
									}}
								>
									{text.text}
								</div>
							)

							let content = (
								<Draggable
									bounds="parent"
									defaultPosition={{ x, y }}
									handle=".memeText"
									key={`draggable${t}`}
									onStart={() => false}
								>
									{textBlock}
								</Draggable>
							)

							if (editable) {
								content = (
									<Draggable
										bounds="parent"
										defaultPosition={{ x, y }}
										handle=".memeText"
										key={`draggable${t}`}
										onDrag={(e, ui) => handleDrag(i, t, e, ui)}
										onStart={() => handleDragStart(i, t)}
										onStop={() => handleDragStop(i, t)}
									>
										{textBlock}
									</Draggable>
								)
							}

							return content
						})}

						<Image
							className={`memeImg ${active && editable ? "active" : ""} ${
								editable ? "editable" : ""
							}`}
							crossOrigin={editable ? null : "anonymous"}
							id={`memeConfigImg${i}`}
							inline
							onClick={() => {
								if (editable) {
									clickImg(i)
								}
							}}
							onError={(image) => (image.target.src = BlankImg)}
							onLoad={async (image) => {
								console.log("onload")
								const { height, width } = image.target
								if (width === 0 || height === 0) {
									return
								}

								if (isInitialRender) {
									await setDimensions(i, height, width)
								}

								await setHeight(height)
								await setWidth(width)

								if (downloadOnLoad && !downloaded) {
									downloadMeme()
									setDownloaded(true)
								}
							}}
							src={`${img}${
								img === "/images/blank.png" || editable
									? ""
									: `?t=${new Date().getTime()}`
							}`}
						/>
					</div>
				)
			})}
		</div>
	)
}

MemeImages.propTypes = {
	clickImg: PropTypes.func,
	downloadMeme: PropTypes.func,
	downloadOnLoad: PropTypes.bool,
	editable: PropTypes.bool,
	handleDrag: PropTypes.func,
	handleDragStart: PropTypes.func,
	handleDragStop: PropTypes.func,
	images: PropTypes.arrayOf(
		PropTypes.shape({
			active: PropTypes.bool,
			height: PropTypes.number,
			img: PropTypes.string,
			name: PropTypes.string,
			path: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
			templateId: PropTypes.number,
			texts: PropTypes.arrayOf(
				PropTypes.shape({
					activeDrags: PropTypes.number,
					backgroundColor: PropTypes.string,
					color: PropTypes.string,
					font: PropTypes.string,
					size: PropTypes.string,
					text: PropTypes.string,
					x: PropTypes.number,
					y: PropTypes.number
				})
			),
			width: PropTypes.number
		})
	),
	isInitialRender: PropTypes.bool,
	setDimensions: PropTypes.func
}

MemeImages.defaultProps = {
	downloadOnLoad: false,
	editable: true
}

export default MemeImages
