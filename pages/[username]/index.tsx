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
	const initialUser = initial.initialUser

	if (typeof params === "undefined") {
		return {
			props: {
				initialUser
			}
		}
	}

	const data = await axios.get(`${baseUrl}api/user/${params.username}`)
	if (data.data.error) {
		initialUser.data = {}
		initialUser.error = true
		initialUser.errorMsg = data.data.msg
	} else {
		initialUser.data = data.data.user
		initialUser.error = false
		initialUser.errorMsg = ""
	}

	initialUser.loading = false

	return {
		props: {
			initialUser
		}
	}
}

const User: React.FC = ({
	changeProfilePic,
	getUser,
	initialUser,
	inverted,
	searchInteractions,
	user
}) => {
	const router = useRouter()
	const username = router.asPath.substr(1)

	const { createdAt, id, img, interactionCount, name } = user.data

	const [bearer, setBearer] = useState(null)
	const [currentUser, setCurrentUser] = useState({})

	useEffect(() => {
		if (typeof username !== "undefined") {
			getUser({ callback: (userId: number) => searchInteractions({ userId }), username })
		}
	}, [getUser, username])

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setBearer(localStorage.getItem("jwtToken"))
			setCurrentUser(userData)
		}
	}, [bearer])

	const loadMore = (page: number, userId: number) => {
		return searchInteractions({ userId, page })
	}

	const imgSrc = img === null || img === "" ? DefaultPic : `${s3BaseUrl}${img}`
	const ProfilePic = () => {
		if (currentUser.id === id) {
			return (
				<ImageUpload
					bearer={bearer}
					callback={(bearer: string, file: string) => changeProfilePic({ bearer, file })}
					fluid
					id={id}
					img={imgSrc === null ? DefaultPic : imgSrc}
					inverted={inverted}
				/>
			)
		}

		return <Image onError={(i) => (i.target.src = DefaultPic)} rounded src={imgSrc} />
	}

	const _img = initialUser.data.img
	const seoTitle = initialUser.error ? "Not found" : initialUser.data.name
	const seoDescription = initialUser.error
		? "Become an ally in the fight against police brutality and corruption"
		: `${initialUser.data.name}'s interactions with the police on AlliesOnly`
	const seoImage = {
		height: 500,
		src: _img === null || _img === "" ? `${s3BaseUrl}logos/logo.png` : `${s3BaseUrl}${_img}`,
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
				{initialUser.error ? (
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
									{user.loading ? (
										<Placeholder inverted={inverted}>
											<Placeholder.Image square />
										</Placeholder>
									) : (
										ProfilePic()
									)}
								</Grid.Column>
								<Grid.Column width={11}>
									{!user.loading && (
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

						{!user.error && !user.loading && (
							<SearchResults
								hasMore={user.interactions.hasMore}
								inverted={inverted}
								justImages
								loading={user.interactions.loading}
								loadMore={({ page, userId }) => loadMore(page, userId)}
								page={user.interactions.page}
								results={user.interactions.results}
								type="interactions"
								userId={id}
							/>
						)}
					</Container>
				)}
			</DefaultLayout>
		</Provider>
	)
}

User.propTypes = {
	changeProfilePic: PropTypes.func,
	getUser: PropTypes.func,
	initialUser: PropTypes.shape({
		data: PropTypes.shape({
			createdAt: PropTypes.string,
			id: PropTypes.number,
			img: PropTypes.string,
			interactionCount: PropTypes.number,
			name: PropTypes.string,
			status: PropTypes.number,
			username: PropTypes.string
		}),
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
		loading: PropTypes.bool
	}),
	inverted: PropTypes.bool,
	searchInteractions: PropTypes.func,
	user: PropTypes.shape({
		data: PropTypes.shape({
			createdAt: PropTypes.string,
			id: PropTypes.number,
			img: PropTypes.string,
			interactionCount: PropTypes.number,
			name: PropTypes.string,
			status: PropTypes.number,
			username: PropTypes.string
		}),
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
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
		loading: PropTypes.bool
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
