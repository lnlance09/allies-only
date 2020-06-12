import { Form, Input, Segment, Select, TextArea } from "semantic-ui-react"
import { CirclePicker } from "react-color"
import { colorOptions } from "@options/colors"
import { fontOptions } from "@options/fonts"
import PropTypes from "prop-types"
import React, { useEffect, useRef, useState } from "react"

const TextBox: React.FunctionComponent = (props) => {
	const node = useRef(null)
	const {
		backgroundColor,
		changeBackgroundColor,
		changeColor,
		changeFont,
		changeFontSize,
		changeText,
		color,
		font,
		fontSize,
		imgIndex,
		inverted,
		text,
		textIndex
	} = props

	const [backgroundColorPickerOpen, setBackgroundColorPicker] = useState(false)
	const [colorPickerOpen, setColorPicker] = useState(false)

	useEffect(() => {
		if (colorPickerOpen) {
			document.addEventListener("mousedown", handleClick)
		} else {
			document.removeEventListener("mousedown", handleClick)
		}

		return () => {
			document.removeEventListener("mousedown", handleClick)
		}
	}, [colorPickerOpen])

	const handleClick = (e) => {
		if (node.current.contains(e.target)) {
			return
		}

		setColorPicker(false)
	}

	const toggleBackgroundColorPicker = () => {
		setBackgroundColorPicker(!backgroundColorPickerOpen)
	}

	const toggleColorPicker = () => {
		setColorPicker(!colorPickerOpen)
	}

	return (
		<div className="textBox">
			<Form inverted={inverted}>
				<Form.Field>
					<TextArea
						placeholder="Text"
						onChange={(e, { value }) => changeText(imgIndex, textIndex, value)}
						rows={2}
						value={text}
					/>
				</Form.Field>
				<Form.Group className="colorFields" unstackable>
					<Form.Field width={11}>
						<Select
							className="fontSelection"
							onChange={(e, { value }) => changeFont(imgIndex, textIndex, value)}
							options={fontOptions}
							search
							value={font}
						/>
					</Form.Field>
					<Form.Field width={5}>
						<Input
							inverted={inverted}
							maxLength={3}
							onChange={(e, { value }) => changeFontSize(imgIndex, textIndex, value)}
							type="text"
							value={`${fontSize}`}
						/>
					</Form.Field>
				</Form.Group>
				<Form.Group unstackable>
					<Form.Field width={8}>
						<div className="colorSelectionWrapper" onClick={toggleColorPicker}>
							<div
								className="colorSelection"
								style={{
									background: color,
									width: "100%"
								}}
							/>
						</div>
						{colorPickerOpen && (
							<div className="colorPickerWrapper" ref={node}>
								<Segment inverted={inverted}>
									<CirclePicker
										colors={colorOptions}
										onChange={(color) => {
											changeColor(imgIndex, textIndex, color)
											setColorPicker(false)
										}}
									/>
								</Segment>
							</div>
						)}
					</Form.Field>
					<Form.Field width={8}>
						<div
							className="colorSelectionWrapper"
							onClick={toggleBackgroundColorPicker}
						>
							<div
								className="colorSelection"
								style={{
									background: backgroundColor,
									width: "100%"
								}}
							/>
						</div>
						{backgroundColorPickerOpen && (
							<div className="colorPickerWrapper" ref={node}>
								<Segment inverted={inverted}>
									<CirclePicker
										colors={colorOptions}
										onChange={(color) => {
											changeBackgroundColor(imgIndex, textIndex, color)
											setBackgroundColorPicker(false)
										}}
									/>
								</Segment>
							</div>
						)}
					</Form.Field>
				</Form.Group>
			</Form>
		</div>
	)
}

TextBox.propTypes = {
	backgroundColor: PropTypes.string,
	changeBackgroundColor: PropTypes.func,
	changeColor: PropTypes.func,
	changeFont: PropTypes.func,
	changeFontSize: PropTypes.func,
	changeText: PropTypes.func,
	color: PropTypes.string,
	font: PropTypes.string,
	fontSize: PropTypes.string,
	imgIndex: PropTypes.number,
	inverted: PropTypes.bool,
	text: PropTypes.string,
	textIndex: PropTypes.number
}

TextBox.defaultProps = {}

export default TextBox
