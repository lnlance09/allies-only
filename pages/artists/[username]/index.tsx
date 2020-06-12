import { changeProfilePic, getUser, getUserMemes, getUserTemplates } from "@actions/user"
import {
	Button,
	Container,
	Dimmer,
	Divider,
	Grid,
	Header,
	Icon,
	Image,
	List,
	Placeholder
} from "semantic-ui-react"
import { s3BaseUrl } from "@options/config"
import { parseJwt } from "@utils/tokenFunctions"
import { useRouter } from "next/router"
import { useDropzone } from "react-dropzone"
import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import DefaultPic from "@public/images/avatar/large/steve.jpg"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Fragment, useCallback, useEffect, useState } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const Artist: React.FunctionComponent = ({
	changeProfilePic,
	error,
	getUser,
	getUserMemes,
	getUserTemplates,
	inverted,
	loading,
	user
}) => {
	const router = useRouter()
	const { username } = router.query

	const { createdAt, id, img, memeCount, memes, name, templateCount, templates } = user

	const [active, setActive] = useState(true)
	const [activeItem, setActiveItem] = useState("memes")
	const [bearer, setBearer] = useState(null)
	const [currentUser, setCurrentUser] = useState({})

	useEffect(() => {
		if (typeof username !== "undefined") {
			getUser({ username })
		}
	}, [getUser, username])

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setBearer(localStorage.getItem("jwtToken"))
			setCurrentUser(userData)
		}
	}, [bearer])

	const onDrop = useCallback(
		(files) => {
			if (files.length > 0) {
				changeProfilePic({
					bearer,
					file: files[0]
				})
			}
		},
		[bearer, changeProfilePic]
	)

	const { getRootProps, getInputProps } = useDropzone({ onDrop })

	const loadMore = (page, userId) => {
		if (activeItem === "memes") {
			return getUserMemes({ page, id: userId })
		}

		if (activeItem === "templates") {
			return getUserTemplates({ page, id: userId })
		}
	}

	let results = memes
	if (activeItem === "templates") {
		results = templates
	}

	const imgSrc = img === null || img === "" ? DefaultPic : `${s3BaseUrl}${img}`

	const ProfilePic = () => {
		const content = (
			<div {...getRootProps()}>
				<input {...getInputProps()} />
				<Header inverted={inverted}>Change your pic</Header>
				<Button className="changePicBtn" color="blue" icon inverted={inverted}>
					<Icon name="image" />
				</Button>
			</div>
		)

		if (currentUser.id === id) {
			return (
				<Dimmer.Dimmable
					as={Image}
					className="profilePic"
					dimmed={active}
					dimmer={{ active, content, inverted: !inverted }}
					onError={(i) => (i.target.src = DefaultPic)}
					onMouseEnter={() => setActive(true)}
					onMouseLeave={() => setActive(false)}
					src={imgSrc}
				/>
			)
		}

		return <Image fluid onError={(i) => (i.target.src = DefaultPic)} src={imgSrc} />
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				containerClassName="artistPage"
				seo={{
					description: `${name}'s profile on Brandy`,
					image: {
						height: 200,
						src: imgSrc,
						width: 200
					},
					title: name,
					url: `artists/${username}`
				}}
				showFooter={false}
			>
				{error ? (
					<Container className="errorMsgContainer" textAlign="center">
						<Header as="h1" inverted={inverted}>
							This artist does not exist
							<div />
							<Button
								color="blue"
								content="Go back"
								inverted={inverted}
								onClick={() => router.push(`/explore/artists`)}
							/>
						</Header>
					</Container>
				) : (
					<Fragment>
						<Grid>
							<Grid.Row>
								<Grid.Column width={4}>
									{loading ? (
										<Placeholder inverted={inverted}>
											<Placeholder.Image square />
										</Placeholder>
									) : (
										ProfilePic()
									)}
								</Grid.Column>
								<Grid.Column width={12}>
									{!loading && (
										<Fragment>
											<Header as="h1" inverted={inverted}>
												{name}
												<Header.Subheader>
													Joined <Moment date={createdAt} fromNow />
												</Header.Subheader>
											</Header>
											<List
												className="artistProfileList"
												horizontal
												inverted={inverted}
												size="big"
											>
												<List.Item
													active={activeItem === "memes"}
													onClick={() => setActiveItem("memes")}
												>
													<b>{memeCount}</b> memes
												</List.Item>
												<List.Item
													active={activeItem === "templates"}
													onClick={() => setActiveItem("templates")}
												>
													<b>{templateCount}</b> templates
												</List.Item>
											</List>
										</Fragment>
									)}
								</Grid.Column>
							</Grid.Row>
						</Grid>

						<Divider section />

						{!error && !loading ? (
							<SearchResults
								hasMore={results.hasMore}
								inverted={inverted}
								justImages
								loading={results.loading}
								loadMore={({ page, userId }) => loadMore(page, userId)}
								page={results.page}
								results={results.results}
								type={activeItem}
								userId={user.id}
							/>
						) : null}
					</Fragment>
				)}
			</DefaultLayout>
		</Provider>
	)
}

Artist.propTypes = {
	changeProfilePic: PropTypes.func,
	error: PropTypes.bool,
	errorMsg: PropTypes.string,
	getUser: PropTypes.func,
	getUserMemes: PropTypes.func,
	getUserTemplates: PropTypes.func,
	inverted: PropTypes.bool,
	loading: PropTypes.bool,
	user: PropTypes.shape({
		createdAt: PropTypes.string,
		id: PropTypes.number,
		img: PropTypes.string,
		memeCount: PropTypes.number,
		memes: PropTypes.shape({
			hasMore: PropTypes.bool,
			loading: PropTypes.bool,
			page: PropTypes.number,
			results: PropTypes.arrayOf(
				PropTypes.oneOfType([
					PropTypes.bool,
					PropTypes.shape({
						caption: PropTypes.string,
						createdAt: PropTypes.string,
						likes: PropTypes.number,
						s3Link: PropTypes.string
					})
				])
			)
		}),
		name: PropTypes.string,
		templateCount: PropTypes.number,
		templates: PropTypes.shape({
			hasMore: PropTypes.bool,
			loading: PropTypes.bool,
			page: PropTypes.number,
			results: PropTypes.arrayOf(
				PropTypes.oneOfType([
					PropTypes.bool,
					PropTypes.shape({
						name: PropTypes.number,
						s3Link: PropTypes.string
					})
				])
			)
		}),
		username: PropTypes.string
	})
}

Artist.defaultProps = {
	changeProfilePic,
	getUser,
	getUserMemes,
	getUserTemplates
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.user,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		changeProfilePic,
		getUser,
		getUserMemes,
		getUserTemplates
	}),
	withTheme("dark")
)(Artist)
