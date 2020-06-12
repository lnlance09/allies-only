import { getTemplate, updateTemplate } from "@actions/template"
import { searchMemes } from "@actions/search"
import {
	Button,
	Container,
	Divider,
	Header,
	Image,
	Input,
	Placeholder,
	Statistic
} from "semantic-ui-react"
import { s3BaseUrl } from "@options/config"
import { parseJwt } from "@utils/tokenFunctions"
import { Provider, connect } from "react-redux"
import { useRouter } from "next/router"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultPic from "@public/images/placeholders/placeholder-dark.jpg"
import DefaultLayout from "@layouts/default"
import Link from "next/link"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const Template: React.FunctionComponent = ({
	data,
	error,
	getTemplate,
	inverted,
	loading,
	memes,
	searchMemes,
	updateTemplate
}) => {
	const router = useRouter()
	const { slug } = router.query

	const [bearer, setBearer] = useState(null)
	const [currentUser, setCurrentUser] = useState({})
	const [editedTitle, setEditedTitle] = useState("")
	const [editMode, setEditMode] = useState(false)

	const { createdAt, id, memeCount, name, s3Link, user } = data
	const title = name === null ? `Untitled Template #${id}` : name
	const img = typeof s3Link === "undefined" ? DefaultPic : `${s3BaseUrl}${s3Link}`

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setBearer(localStorage.getItem("jwtToken"))
			setCurrentUser(userData)
		}

		if (typeof slug !== "undefined") {
			getTemplate({ id: slug })
			searchMemes({ templateId: slug })
		}
	}, [slug])

	const loadMore = (page, templateId) => {
		return searchMemes({ page, templateId })
	}

	const onChangeTitle = (e, { value }) => {
		setEditedTitle(value)
	}

	const onClickTemplate = () => {
		router.push(`/create?templateId=${id}`)
	}

	const saveTemplate = () => {
		updateTemplate({
			bearer,
			callback: () => setEditMode(false),
			data: { name: editedTitle },
			id
		})
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				containerClassName="templatePage"
				seo={{
					description: "",
					image: {
						height: 200,
						src: img,
						width: 200
					},
					title,
					url: `templates/${slug}`
				}}
				showFooter={false}
			>
				{!error && (
					<div className={`templatePageHero ${inverted ? "inverted" : ""}`}>
						<Container>
							{loading ? (
								<Placeholder fluid inverted={inverted}>
									<Placeholder.Image square />
								</Placeholder>
							) : (
								<Image
									centered
									onError={(i) => (i.target.src = DefaultPic)}
									src={img}
								/>
							)}
						</Container>
					</div>
				)}

				{error ? (
					<Container className="errorMsgContainer" textAlign="center">
						<Header as="h1" inverted={inverted}>
							This template does not exist
							<div />
							<Button
								color="blue"
								content="Go back"
								inverted={inverted}
								onClick={() => router.push(`/explore/templates`)}
							/>
						</Header>
					</Container>
				) : (
					<Container textAlign="center">
						{!loading && (
							<Fragment>
								<Header as="h1" inverted={inverted}>
									{editMode ? (
										<Input
											className="editTemplateNameInput"
											fluid
											inverted={inverted}
											onChange={onChangeTitle}
											placeholder="Title"
											value={editedTitle}
										/>
									) : (
										title
									)}
									<Header.Subheader>
										<Moment date={createdAt} fromNow /> •{" "}
										<Link href={`/artists/${user.username}`}>
											<a>@{user.username}</a>
										</Link>
										{currentUser.id === user.id && (
											<Fragment>
												{" "}
												•{" "}
												{editMode ? (
													<span
														className="editTemplate"
														onClick={() => setEditMode(false)}
													>
														cancel
													</span>
												) : (
													<span
														className="editTemplate"
														onClick={() => {
															setEditedTitle(title)
															setEditMode(true)
														}}
													>
														edit
													</span>
												)}
											</Fragment>
										)}
									</Header.Subheader>
								</Header>

								<div style={{ marginBottom: "24px" }}>
									<Statistic inverted={inverted}>
										<Statistic.Value>{memeCount}</Statistic.Value>
										<Statistic.Label>Memes Made</Statistic.Label>
									</Statistic>
								</div>

								{editMode ? (
									<Button
										color="blue"
										content="Save"
										inverted={inverted}
										onClick={saveTemplate}
										size="big"
									/>
								) : (
									<Button
										color="blue"
										content="Use this template"
										inverted={inverted}
										onClick={onClickTemplate}
										size="big"
									/>
								)}
							</Fragment>
						)}

						<Divider horizontal inverted={inverted} section>
							Featured in
						</Divider>

						<SearchResults
							hasMore={memes.hasMore}
							justImages
							inverted={inverted}
							loading={memes.loading}
							loadMore={({ page, templateId }) => loadMore(page, templateId)}
							page={memes.page}
							results={memes.results}
							type="memes"
							templateId={slug}
						/>
					</Container>
				)}
			</DefaultLayout>
		</Provider>
	)
}

Template.propTypes = {
	data: PropTypes.shape({
		createdAt: PropTypes.string,
		id: PropTypes.number,
		memeCount: PropTypes.number,
		name: PropTypes.string,
		s3Link: PropTypes.string,
		user: PropTypes.shape({
			id: PropTypes.number,
			img: PropTypes.string,
			name: PropTypes.string,
			username: PropTypes.string
		})
	}),
	error: PropTypes.bool,
	errorMsg: PropTypes.string,
	inverted: PropTypes.bool,
	getTemplate: PropTypes.func,
	loading: PropTypes.bool,
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
					createdBy: PropTypes.number,
					id: PropTypes.number,
					likes: PropTypes.number,
					name: PropTypes.string,
					s3Link: PropTypes.string,
					userImg: PropTypes.string,
					userName: PropTypes.string,
					username: PropTypes.string,
					views: PropTypes.number
				})
			])
		)
	}),
	searchMemes: PropTypes.func,
	updateTemplate: PropTypes.func
}

Template.defaultProps = {
	getTemplate,
	data: {
		user: {}
	},
	memes: {
		loading: true,
		results: [false, false, false, false, false, false]
	},
	searchMemes,
	updateTemplate
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.template,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		getTemplate,
		searchMemes,
		updateTemplate
	}),
	withTheme("dark")
)(Template)
