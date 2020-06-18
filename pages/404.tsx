import { changeProfilePic, getInteractions, getUser } from "@actions/user"
import {
	Button,
	Container,
	Dimmer,
	Divider,
	Grid,
	Header,
	Icon,
	Image,
	Label,
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
import DefaultPic from "@public/images/logos/logo.png"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Fragment, useCallback, useEffect, useState } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const User: React.FunctionComponent = ({
	changeProfilePic,
	error,
	getInteractions,
	getUser,
	inverted,
	loading,
	user
}) => {
	const router = useRouter()
	const username = router.asPath.substr(1)

	const { createdAt, id, img, interactionCount, interactions, name } = user

	const [active, setActive] = useState(true)
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

		return <Image onError={(i) => (i.target.src = DefaultPic)} src={imgSrc} />
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem={currentUser.id === id ? "profile" : "allies"}
				containerClassName="allyPage"
				seo={{
					description: `${name}'s interactions with the police on AlliesOnly`,
					image: {
						height: 200,
						src: imgSrc,
						width: 200
					},
					title: name,
					url: username
				}}
				showFooter={false}
			>
				{error ? (
					<Container className="errorMsgContainer" textAlign="center">
						<Header as="h1" inverted={inverted}>
							This user does not exist
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
											<Label color="orange" size="large">
												{interactionCount} interactions
											</Label>
										</Fragment>
									)}
								</Grid.Column>
							</Grid.Row>
						</Grid>

						<Divider section />

						{!error && !loading ? (
							<SearchResults
								hasMore={interactions.hasMore}
								inverted={inverted}
								justImages
								loading={interactions.loading}
								loadMore={({ page, userId }) => loadMore(page, userId)}
								page={interactions.page}
								results={interactions.results}
								type="interactions"
								userId={user.id}
							/>
						) : null}
					</Fragment>
				)}
			</DefaultLayout>
		</Provider>
	)
}

User.propTypes = {
	changeProfilePic: PropTypes.func,
	error: PropTypes.bool,
	errorMsg: PropTypes.string,
	getInteractions: PropTypes.func,
	getUser: PropTypes.func,
	inverted: PropTypes.bool,
	loading: PropTypes.bool,
	user: PropTypes.shape({
		createdAt: PropTypes.string,
		id: PropTypes.number,
		img: PropTypes.string,
		interactionCount: PropTypes.number,
		interactions: PropTypes.shape({
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
		status: PropTypes.number,
		username: PropTypes.string
	})
}

User.defaultProps = {
	changeProfilePic,
	getInteractions,
	getUser
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.user,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		changeProfilePic,
		getInteractions,
		getUser
	}),
	withTheme("dark")
)(User)
