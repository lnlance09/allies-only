import { createMeme, getMeme } from "@actions/meme"
import { getTemplate } from "@actions/template"
import { Button, Divider, Form, Grid, TextArea } from "semantic-ui-react"
import { useRouter } from "next/router"
import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import axios from "axios"
import DefaultLayout from "@layouts/default"
import MemeConfig from "@components/memeConfig"
import MemeImages from "@components/memeImages"
import PropTypes from "prop-types"
import React, { useCallback, useEffect, useState } from "react"
import store from "@store"

const Create: React.FunctionComponent = (props) => {
	const router = useRouter()
	const { id, templateId } = router.query

	const [bearer, setBearer] = useState("")
	const [canSubmit, setCanSubmit] = useState(false)
	const [caption, setCaption] = useState("")
	const [formVisible, setFormVisible] = useState(false)
	const [images, setImages] = useState(props.images)
	const [isInitialRender, setInitialRender] = useState(true)
	const [processing, setProcessing] = useState(false)

	useEffect(() => {
		const token = localStorage.getItem("jwtToken")
		if (typeof token !== "undefined") {
			setBearer(token)
		}

		if (typeof id === "undefined") {
			setImages([
				{
					active: true,
					img: "/images/blank.png",
					path: null,
					texts: [
						{
							activeDrags: 0,
							backgroundColor: "transparent",
							color: "#0c243c",
							font: "OswaldRegular",
							height: 0,
							size: "32",
							text: "",
							width: 0,
							x: 0,
							y: 10
						}
					]
				}
			])
			setInitialRender(true)
			setCanSubmit(false)
		}

		if (typeof id !== "undefined") {
			props.getMeme({ callback: (data) => setImages(data), setImages, id })
			setInitialRender(false)
			setCanSubmit(true)
		}

		if (typeof templateId !== "undefined") {
			props.getTemplate({
				callback: (id, img) => setTemplate(id, img),
				id: templateId
			})
			setInitialRender(false)
			setCanSubmit(true)
		}
	}, [id, templateId])

	const addMoreImage = useCallback(() => {
		images.map((img, i) => {
			images[i].active = false
		})
		const newImages = [
			...images,
			{
				active: true,
				img: "",
				path: null,
				texts: [
					{
						activeDrags: 0,
						backgroundColor: "transparent",
						color: "#0c243c",
						font: "OswaldRegular",
						height: 0,
						size: "32",
						text: "",
						width: 0,
						x: 0,
						y: 10
					}
				]
			}
		]
		setImages(newImages)
	}, [images])

	const addMoreText = (imgIndex) => {
		const newImages = [...images]
		const texts = images[imgIndex].texts
		const textCount = texts.length
		let lastY = texts[textCount - 1].y
		if (isNaN(lastY)) {
			lastY = 0
		}

		const newTexts = [
			...images[imgIndex].texts,
			{
				activeDrags: 0,
				backgroundColor: "transparent",
				color: "#0c243c",
				font: "OswaldRegular",
				hright: 0,
				size: "32",
				text: "",
				width: 0,
				x: 0,
				y: lastY + 35
			}
		]
		newImages[imgIndex].texts = newTexts
		setImages(newImages)
	}

	const changeBackgroundColor = (imgIndex, textIndex, value) => {
		const newImages = [...images]
		newImages[imgIndex].texts[textIndex].backgroundColor = value.hex
		setImages(newImages)
	}

	const changeColor = (imgIndex, textIndex, value) => {
		const newImages = [...images]
		newImages[imgIndex].texts[textIndex].color = value.hex
		setImages(newImages)
	}

	const changeFont = (imgIndex, textIndex, value) => {
		const newImages = [...images]
		newImages[imgIndex].texts[textIndex].font = value
		setImages(newImages)
	}

	const changeFontSize = (imgIndex, textIndex, value) => {
		const newImages = [...images]
		newImages[imgIndex].texts[textIndex].size = value
		setImages(newImages)
	}

	const changeText = (imgIndex, textIndex, value) => {
		const newImages = [...images]
		newImages[imgIndex].texts[textIndex].text = value
		setImages(newImages)
	}

	const clickImg = (imgIndex) => {
		const newImages = [...images]
		newImages.map((img, i) => {
			newImages[i].active = false
		})
		newImages[imgIndex].active = true
		setImages(newImages)
	}

	const createMeme = async () => {
		if (!formVisible) {
			setFormVisible(true)
			return
		}

		setProcessing(true)
		props.createMeme({ bearer, caption, images })
	}

	const createTemplate = (img, imgIndex, isFile) => {
		axios
			.post("/api/template/create", {
				img
			})
			.then(async (response) => {
				const { data } = response
				if (!data.error) {
					const newImages = [...images]
					newImages[imgIndex].templateId = data.id
					setImages(newImages)
					setCanSubmit(true)
				}
			})
			.catch((error) => {
				console.log(error)
			})
	}

	const handleDrag = (imgIndex, textIndex, e, ui) => {
		const { x, y } = images[imgIndex].texts[textIndex]
		const newImages = [...images]
		newImages[imgIndex].texts[textIndex].x = x + ui.deltaX
		newImages[imgIndex].texts[textIndex].y = y + ui.deltaY
		setImages(newImages)
	}

	const handleDragStart = (imgIndex, textIndex) => {
		const newImages = [...images]
		newImages[imgIndex].texts[textIndex].activeDrags++
		setImages(newImages)
	}

	const handleDragStop = (imgIndex, textIndex) => {
		const newImages = [...images]
		newImages[imgIndex].texts[textIndex].activeDrags--
		setImages(newImages)
	}

	const onFileUpload = (path, img, imgIndex) => {
		createTemplate(img, imgIndex, true)
		const newImages = [...images]
		newImages[imgIndex].img = img
		newImages[imgIndex].path = path
		setImages(newImages)
	}

	const onKeyUp = (e, imgIndex) => {
		if (e.keyCode === 8) {
			const newImages = [...images]
			newImages[imgIndex].img = ""
			newImages[imgIndex].path = null
			setImages(newImages)
		}
	}

	const onPaste = (e, imgIndex) => {
		const url = e.clipboardData.getData("Text")
		createTemplate(url, imgIndex, false)

		const newImages = [...images]
		newImages[imgIndex].img = url
		setImages(newImages)
	}

	const setDimensions = (imgIndex, height, width) => {
		const image = images[imgIndex]
		if (height === image.height && width === image.width) {
			return
		}

		const newImages = [...images]
		newImages[imgIndex].height = height
		newImages[imgIndex].width = width
		setImages(newImages)
	}

	const setTemplate = (id, img) => {
		const newImages = [...images]
		newImages[0].img = img
		newImages[0].templateId = id
		setImages(newImages)
	}

	console.log("images", images)

	return (
		<Provider store={store}>
			<DefaultLayout
				containerClassName="createPage"
				seo={{
					description: "Creating a meme was never so quick and easy",
					image: {
						height: 512,
						src: "/public/images/logos/default-logo.png",
						width: 512
					},
					title: "Create a Meme",
					url: "create"
				}}
				showFooter={false}
			>
				<Grid stackable>
					<Grid.Row>
						<Grid.Column width={10}>
							<MemeImages
								clickImg={clickImg}
								handleDrag={handleDrag}
								handleDragStart={handleDragStart}
								handleDragStop={handleDragStop}
								images={images}
								isInitialRender={isInitialRender}
								setDimensions={setDimensions}
							/>
						</Grid.Column>
						<Grid.Column width={6}>
							<MemeConfig
								addMoreText={addMoreText}
								changeBackgroundColor={changeBackgroundColor}
								changeColor={changeColor}
								changeFont={changeFont}
								changeFontSize={changeFontSize}
								changeText={changeText}
								images={images}
								inverted={props.inverted}
								onFileUpload={onFileUpload}
								onKeyUp={onKeyUp}
								onPaste={onPaste}
							/>
							<p className="addAnotherImage">
								<span onClick={addMoreImage}>Add another image</span>
							</p>
						</Grid.Column>
					</Grid.Row>
				</Grid>

				<Divider hidden inverted={props.inverted} section />

				{formVisible && (
					<Form size="big">
						<TextArea
							inverted={props.inverted}
							placeholder="Caption (Optional)"
							onChange={(e, { value }) => setCaption(value)}
							row={3}
							value={caption}
						/>
						<Divider inverted={props.inverted} />
					</Form>
				)}

				<Button
					color="blue"
					content="Create"
					disabled={!canSubmit}
					fluid
					inverted={props.inverted}
					loading={processing}
					onClick={createMeme}
					size="big"
					style={{ marginTop: "16px" }}
				/>
			</DefaultLayout>
		</Provider>
	)
}

Create.propTypes = {
	createMeme: PropTypes.func,
	getMeme: PropTypes.func,
	getTemplate: PropTypes.func,
	images: PropTypes.arrayOf(
		PropTypes.shape({
			active: PropTypes.bool,
			img: PropTypes.string,
			path: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
			texts: PropTypes.arrayOf(
				PropTypes.shape({
					activeDrags: PropTypes.number,
					backgroundColor: PropTypes.string,
					color: PropTypes.string,
					font: PropTypes.string,
					height: PropTypes.number,
					size: PropTypes.string,
					text: PropTypes.string,
					width: PropTypes.number,
					x: PropTypes.number,
					y: PropTypes.number
				})
			)
		})
	),
	inverted: PropTypes.bool
}

Create.defaultProps = {
	createMeme,
	getMeme,
	getTemplate
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.meme,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		createMeme,
		getMeme,
		getTemplate
	}),
	withTheme("dark")
)(Create)
