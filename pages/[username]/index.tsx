import { searchInteractions } from "@actions/interaction"
import { changeProfilePic, getUser } from "@actions/user"
import {
	Button,
	Container,
	Divider,
	Grid,
	Header,
	Image,
	Label,
	Placeholder
} from "semantic-ui-react"
import { RootState } from "@store/reducer"
import { GetServerSideProps } from "next"
import { initial } from "@reducers/user"
import { InitialPageState } from "@interfaces/options"
import { s3BaseUrl } from "@options/config"
import { parseJwt } from "@utils/tokenFunctions"
import { useRouter } from "next/router"
import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import { baseUrl } from "@options/config"
import axios from "axios"
import DefaultLayout from "@layouts/default"
import DefaultPic from "@public/images/avatar/large/joe.jpg"
import ImageUpload from "@components/imageUpload"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import SearchResults from "@components/searchResults"
import store from "@store/index"

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	let user = initial.user

	if (typeof params === "undefined") {
		return {
			props: {
				error: true,
				errorMsg: "This ally does not exist",
				user
			}
		}
	}

	let error = false
	let errorMsg = ""

	const data = await axios.get(`${baseUrl}api/user/${params.username}`)
	if (data.data.error) {
		error = true
		errorMsg = data.data.msg
	} else {
		user = data.data.user
		error = false
		errorMsg = ""

		const interactionsData = await axios.get(`${baseUrl}api/interaction/search`, {
			params: {
				userId: data.data.user.id
			}
		})
		const interactions = interactionsData.data
		user.interactions = interactions
		user.interactions.results = interactions.interactions
	}

	console.log({
		error,
		errorMsg,
		loading: false,
		user
	})

	return {
		props: {
			error,
			errorMsg,
			loading: false,
			user
		}
	}
}

const User: React.FunctionComponent = ({
	changeProfilePic,
	error,
	getUser,
	inverted,
	loading,
	searchInteractions,
	user
}) => {
	const router = useRouter()
	const username = router.asPath.substr(1)

	const { createdAt, id, img, interactionCount, interactions, name } = user

	const [bearer, setBearer] = useState(null)
	const [currentUser, setCurrentUser] = useState({})

	useEffect(() => {
		if (typeof username !== "undefined") {
			getUser({ callback: (userId) => searchInteractions({ userId }), username })
		}
	}, [getUser, username])

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setBearer(localStorage.getItem("jwtToken"))
			setCurrentUser(userData)
		}
	}, [bearer])

	const loadMore = (page, userId) => {
		return searchInteractions({ userId, page })
	}

	const imgSrc = img === null || img === "" ? DefaultPic : `${s3BaseUrl}${img}`

	const ProfilePic = () => {
		if (currentUser.id === id) {
			return (
				<ImageUpload
					bearer={bearer}
					callback={(bearer, file) => changeProfilePic({ bearer, file })}
					fluid
					id={id}
					img={imgSrc === null ? DefaultPic : imgSrc}
					inverted={inverted}
				/>
			)
		}

		return <Image onError={(i) => (i.target.src = DefaultPic)} rounded src={imgSrc} />
	}

	const seoTitle = error ? "Not found" : name
	const seoDescription = error
		? "Become an ally in the fight against police brutality and corruption"
		: `${name}'s interactions with the police on AlliesOnly`
	const seoImage = {
		height: 500,
		src: img,
		width: 500
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem={currentUser.id === id && bearer !== null ? "profile" : "allies"}
				containerClassName="allyPage"
				seo={{
					description: seoDescription,
					image: seoImage,
					title: seoTitle,
					url: username
				}}
				showFooter={false}
			>
				{error ? (
					<Container className="errorMsgContainer" textAlign="center">
						<Header as="h1" inverted={inverted}>
							This user does not exist
							<div />
							<Button
								color="yellow"
								content="Search all allies"
								inverted={inverted}
								onClick={() => router.push(`/allies`)}
							/>
						</Header>
					</Container>
				) : (
					<Container>
						<Grid>
							<Grid.Row>
								<Grid.Column width={5}>
									{loading ? (
										<Placeholder inverted={inverted}>
											<Placeholder.Image square />
										</Placeholder>
									) : (
										ProfilePic()
									)}
								</Grid.Column>
								<Grid.Column width={11}>
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
								userId={id}
							/>
						) : null}
					</Container>
				)}
			</DefaultLayout>
		</Provider>
	)
}

User.propTypes = {
	changeProfilePic: PropTypes.func,
	error: PropTypes.bool,
	errorMsg: PropTypes.string,
	getUser: PropTypes.func,
	inverted: PropTypes.bool,
	loading: PropTypes.bool,
	searchInteractions: PropTypes.func,
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
	getUser,
	searchInteractions
}

const mapStateToProps = (state: RootState, ownProps: InitialPageState) => ({
	...state.user,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		changeProfilePic,
		getUser,
		searchInteractions
	}),
	withTheme("dark")
)(User)
