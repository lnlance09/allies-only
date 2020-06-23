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
import { s3BaseUrl } from "@options/config"
import { parseJwt } from "@utils/tokenFunctions"
import { useRouter } from "next/router"
import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import DefaultPic from "@public/images/avatar/large/joe.jpg"
import ImageUpload from "@components/imageUpload"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

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

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem={currentUser.id === id && bearer !== null ? "profile" : "allies"}
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

const mapStateToProps = (state: any, ownProps: any) => ({
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
