import { getMeme, updateImg, updateMeme, updateViews } from "@actions/meme"
import {
	Button,
	Container,
	Divider,
	Form,
	Grid,
	Header,
	Image,
	Input,
	Placeholder,
	TextArea
} from "semantic-ui-react"
import { parseJwt } from "@utils/tokenFunctions"
import { useRouter } from "next/router"
import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import html2canvas from "html2canvas"
import LazyLoad from "react-lazyload"
import Link from "next/link"
import LinkedText from "@components/linkedText"
import MemeImages from "@components/memeImages"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useRef, useState } from "react"
import store from "@store"

const Meme: React.FunctionComponent = ({
	getMeme,
	inverted,
	meme,
	updateImg,
	updateMeme,
	updateViews
}) => {
	const node = useRef(null)
	const router = useRouter()
	const { download, slug } = router.query

	const { data, error, loading } = meme
	const { createdAt, id, img, name, templates, user, views } = data

	const [bearer, setBearer] = useState(null)
	const [caption, setCaption] = useState(data.caption)
	const [currentUser, setCurrentUser] = useState({})
	const [editMode, setEditMode] = useState(false)
	const [title, setTitle] = useState(name)

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setBearer(localStorage.getItem("jwtToken"))
			setCurrentUser(userData)
		}

		if (typeof slug !== "undefined") {
			getMeme({ id: slug })
			updateViews({ id: slug })
		}
	}, [slug])

	useEffect(() => {
		setCaption(data.caption)
		setTitle(name)

		if (editMode) {
			document.addEventListener("mousedown", handleClick)
		} else {
			document.removeEventListener("mousedown", handleClick)
		}

		return () => {
			document.removeEventListener("mousedown", handleClick)
		}
	}, [editMode])

	const downloadMeme = () => {
		const el = document.getElementById("memeContainer")
		el.classList.add("downloading")

		html2canvas(el, {
			allowTaint: true,
			scale: 1,
			scrollX: -7,
			scrollY: -window.scrollY,
			useCORS: true
		}).then((canvas) => {
			const ctx = canvas.getContext("2d")
			ctx.globalAlpha = 0.5
			const img = canvas.toDataURL("image/png")
			el.classList.remove("downloading")

			updateImg({ file: img, id })

			const link = document.createElement("a")
			link.download = `meme.png`
			link.href = img
			link.click()
		})
	}

	const handleClick = (e) => {
		if (node.current.contains(e.target)) {
			return
		}
		setEditMode(false)
	}

	const onClickTemplate = (templateId) => {
		router.push(`/template/${templateId}`)
	}

	const RightColumn = (
		<Fragment>
			{!editMode && (
				<Header as="h1" inverted={inverted}>
					{name}
					<Header.Subheader>
						<Moment date={createdAt} fromNow /> •{" "}
						<Link href={`/artists/${user.username}`}>
							<a>{user.username}</a>
						</Link>{" "}
						• {views} views
						{currentUser.id === user.id && (
							<Fragment>
								{" "}
								•{" "}
								<span className="editMeme" onClick={() => setEditMode(true)}>
									Edit
								</span>
							</Fragment>
						)}
					</Header.Subheader>
				</Header>
			)}

			{editMode ? (
				<div ref={node}>
					<Form>
						<Input
							fluid
							inverted={inverted}
							onChange={(e, { value }) => setTitle(value)}
							placeholder="Title"
							value={title}
						/>
						<Divider />
						<TextArea
							inverted={inverted}
							onChange={(e, { value }) => setCaption(value)}
							onClick={() => setEditMode(true)}
							placeholder="Caption"
							rows={5}
							value={caption}
						/>
						<Button
							className="memeUpdateButton"
							color="blue"
							content="Update"
							fluid
							inverted={inverted}
							onClick={() =>
								updateMeme({
									bearer,
									callback: () => setEditMode(false),
									data: { caption },
									id
								})
							}
						/>
					</Form>
				</div>
			) : (
				<Header as="p" className="memeCaption" inverted={inverted}>
					<LinkedText text={data.caption} />
				</Header>
			)}

			<div style={{ margin: "24px 0 12px 0" }}>
				<Image.Group className="templateImages" size="tiny">
					{templates.map((template, i) => (
						<Image
							key={`templateImage${i}`}
							onClick={() => onClickTemplate(template.templateId)}
							src={template.img}
							ui={false}
						/>
					))}
				</Image.Group>
			</div>

			<Button
				color="green"
				content="Download"
				fluid
				icon="download"
				inverted={inverted}
				onClick={downloadMeme}
			/>
			<Button
				color="blue"
				content="Fork"
				fluid
				icon="fork"
				inverted={inverted}
				onClick={() => router.push(`/create?id=${slug}`)}
				style={{ marginTop: "15px" }}
			/>
		</Fragment>
	)

	return (
		<Provider store={store}>
			<DefaultLayout
				containerClassName="memePage"
				seo={{
					description: caption,
					image: {
						height: 512,
						src: img,
						width: 512
					},
					title: name,
					url: `meme/${slug}`
				}}
				showFooter={false}
			>
				<Fragment>
					{error ? (
						<Container className="errorMsgContainer" textAlign="center">
							<Header as="h1" inverted={inverted}>
								This meme does not exist
								<div />
								<Button
									color="blue"
									content="Go back"
									inverted={inverted}
									onClick={() => router.push(`/explore/memes`)}
								/>
							</Header>
						</Container>
					) : (
						<Grid inverted stackable>
							<Grid.Row>
								<Grid.Column width={10}>
									{loading ? (
										<Placeholder fluid inverted={inverted}>
											<Placeholder.Image square />
										</Placeholder>
									) : (
										<LazyLoad height={200}>
											<MemeImages
												downloadMeme={downloadMeme}
												downloadOnLoad={download === "1"}
												editable={false}
												images={templates}
												isInitialRender={false}
											/>
										</LazyLoad>
									)}
								</Grid.Column>
								<Grid.Column width={6}>{!loading && RightColumn}</Grid.Column>
							</Grid.Row>
						</Grid>
					)}
				</Fragment>
			</DefaultLayout>
		</Provider>
	)
}

Meme.propTypes = {
	getMeme: PropTypes.func,
	inverted: PropTypes.bool,
	meme: PropTypes.shape({
		data: PropTypes.shape({
			caption: PropTypes.string,
			createdAt: PropTypes.string,
			id: PropTypes.bool,
			img: PropTypes.string,
			name: PropTypes.string,
			s3Link: PropTypes.string,
			templates: PropTypes.arrayOf(
				PropTypes.shape({
					img: PropTypes.string,
					name: PropTypes.string,
					templateId: PropTypes.number,
					texts: PropTypes.arrayOf(
						PropTypes.shape({
							backgroundColor: PropTypes.string,
							color: PropTypes.string,
							font: PropTypes.string,
							size: PropTypes.string,
							text: PropTypes.string,
							x: PropTypes.number,
							y: PropTypes.number
						})
					)
				})
			),
			user: PropTypes.shape({
				id: PropTypes.number,
				img: PropTypes.string,
				name: PropTypes.string,
				username: PropTypes.string
			}),
			views: PropTypes.number
		}),
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
		loading: PropTypes.bool
	}),
	updateImg: PropTypes.func,
	updateMeme: PropTypes.func,
	updateViews: PropTypes.func
}

Meme.defaultProps = {
	getMeme,
	meme: {},
	updateImg,
	updateMeme,
	updateViews
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.meme,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		getMeme,
		updateImg,
		updateMeme,
		updateViews
	}),
	withTheme("dark")
)(Meme)
