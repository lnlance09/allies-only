import {
	createInteraction,
	getComments,
	getInteraction,
	likeComment,
	postComment,
	searchInteractions,
	setVideo,
	unlikeComment,
	updateInteraction,
	updateViews,
	uploadVideo
} from "@actions/interaction"
import {
	Button,
	Container,
	Dimmer,
	Divider,
	Dropdown,
	Form,
	Header,
	Icon,
	Image,
	Input,
	List,
	Loader,
	Segment,
	TextArea
} from "semantic-ui-react"
import { RootState } from "@store/reducer"
import { GetServerSideProps } from "next"
import { initial } from "@reducers/interaction"
import { DropdownOption, InitialPageState } from "@interfaces/options"
import { Provider, connect } from "react-redux"
import { fetchDepartments } from "@options/departments"
import { fetchOfficers } from "@options/officers"
import { s3BaseUrl } from "@options/config"
import { useRouter } from "next/router"
import { parseJwt } from "@utils/tokenFunctions"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import { baseUrl } from "@options/config"
import axios from "axios"
import Comments from "@components/comments"
import DefaultLayout from "@layouts/default"
import DefaultPic from "@public/images/avatar/officer.png"
import Dropzone from "react-dropzone"
import Link from "next/link"
import LinkedText from "@components/linkedText"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { useEffect, useState, Fragment } from "react"
import ReactPlayer from "react-player"
import SearchResults from "@components/searchResults"
import store from "@store"
import VideoInput from "@components/videoInput"

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const initialInteraction = initial.initialInteraction

	if (typeof params === "undefined") {
		return {
			props: {
				initialInteraction
			}
		}
	}

	if (params.slug === "create") {
		return {
			props: {
				initialInteraction
			}
		}
	}

	const data = await axios.get(`${baseUrl}api/interaction/${params.slug}`)
	if (data.data.error) {
		initialInteraction.data = {
			department: {},
			officers: [],
			user: {},
			video: null
		}
		initialInteraction.error = true
		initialInteraction.errorMsg = data.data.msg
	} else {
		initialInteraction.data = data.data.interaction
		initialInteraction.error = false
		initialInteraction.errorMsg = ""
	}

	initialInteraction.loading = false

	return {
		props: {
			initialInteraction
		}
	}
}

const Interaction: React.FC = ({
	createInteraction,
	getComments,
	getInteraction,
	initialInteraction,
	interaction,
	interactions,
	inverted,
	likeComment,
	postComment,
	searchInteractions,
	setVideo,
	unlikeComment,
	updateInteraction,
	updateViews,
	uploadVideo
}) => {
	const router = useRouter()
	const { commentId, departmentId, officerId, replyId, slug } = router.query

	const [authenticated, setAuthenticated] = useState(null)
	const [bearer, setBearer] = useState(null)
	const [createMode, setCreateMode] = useState(slug === "create")
	const [department, setDepartment] = useState("")
	const [departmentOptions, setDepartmentOptions] = useState([])
	const [description, setDescription] = useState(
		typeof interaction.data.description === "undefined" ? "" : interaction.data.description
	)
	const [editMode, setEditMode] = useState(false)
	const [formLoading, setFormLoading] = useState(false)
	const [loading, setLoading] = useState(false)
	const [officer, setOfficer] = useState([])
	const [officersClicked, setOfficersClicked] = useState(false)
	const [officerOptions, setOfficerOptions] = useState([])
	const [selectedOfficers, setSelectedOfficers] = useState([])
	const [title, setTitle] = useState("")
	const [user, setUser] = useState({})

	useEffect(() => {
		const getInitialProps = async () => {
			if (slug === "create") {
				setCreateMode(true)

				let departmentOptions: DropdownOption[] = []
				if (typeof departmentId !== "undefined") {
					departmentOptions = await fetchDepartments({ id: parseInt(departmentId, 10) })
					setDepartmentOptions(departmentOptions)
					setDepartment(parseInt(departmentId, 10))
				} else {
					departmentOptions = await fetchDepartments({ q: "" })
					setDepartmentOptions(departmentOptions)
				}

				const officerOptions = await fetchOfficers({
					departmentId: parseInt(departmentId, 10)
				})
				setOfficerOptions(officerOptions)

				if (typeof officerId !== "undefined") {
					setOfficer([parseInt(officerId, 10)])
					const officers = officerOptions.filter(
						(officer) => officer.value === parseInt(officerId, 10)
					)
					setSelectedOfficers(officers)
				}
			}

			if (typeof slug !== "undefined" && slug !== "create") {
				setCreateMode(false)
				await getInteraction({
					callback: async (departmentId: number, description, officers) => {
						updateViews({ id: slug })
						getComments({
							bearer: localStorage.getItem("jwtToken"),
							commentId,
							interactionId: slug,
							page: 0,
							replyId
						})
						setDescription(description)
						setDepartment(departmentId)
						const departmentOptions = await fetchDepartments({
							id: departmentId
						})
						setDepartmentOptions(departmentOptions)

						if (officers.length > 0) {
							const officerOptions = await fetchOfficers({ departmentId })
							setOfficerOptions(officerOptions)
							setSelectedOfficers(officerOptions)

							const officerValues = []
							officers.map((o) => {
								officerValues.push(o.id)
							})
							setOfficer(officerValues)
						}

						searchInteractions({ exclude: [slug], page: 0 })
					},
					id: slug
				})
			}
		}

		getInitialProps()
	}, [slug])

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setAuthenticated(true)
			setBearer(localStorage.getItem("jwtToken"))
			setUser(userData)
		}
	}, [bearer])

	const addInteraction = () => {
		setFormLoading(true)
		createInteraction({
			bearer,
			callback: () => setFormLoading(false),
			department,
			description,
			file: interaction.data.video,
			officer: selectedOfficers,
			thumbnail: interaction.data.thumbnail,
			title
		})
	}

	const changeDepartment = async (e) => {
		const q = e.target.value
		const departmentOptions = await fetchDepartments({ q })
		setDepartmentOptions(departmentOptions)
	}

	const loadMore = (exclude: number[], page: number) => {
		return searchInteractions({ exclude, page })
	}

	const onDrop = (files) => {
		if (files.length > 0) {
			setLoading(true)
			uploadVideo({ callback: () => setLoading(false), file: files[0] })
		}
	}

	const renderLabel = (option) => ({
		color: option.color,
		content: option.text
	})

	const selectDepartment = async (e, { value }) => {
		if (department !== value) {
			setDepartment(value)
			const officerOptions = await fetchOfficers({ departmentId: value })
			setOfficerOptions(officerOptions)
			setOfficer([])
			setSelectedOfficers([])
		}
	}

	const changeOfficer = async (e) => {
		const q = e.target.value
		const officerOptions = await fetchOfficers({ departmentId: department, q })

		if (slug === "create") {
			setOfficerOptions([...selectedOfficers, ...officerOptions])
		} else {
			setOfficerOptions([selectedOfficers, ...officerOptions])
		}
	}

	const selectOfficer = async (e, { value }) => {
		const removed = officer.length > value.length
		setOfficer(value)

		if (removed) {
			const officers = selectedOfficers.filter((officer) => value.includes(officer.value))
			setSelectedOfficers(officers)
		} else {
			const officers = await officerOptions.filter(
				(officer) => officer.value === value[value.length - 1]
			)
			if (officers.length > 0) {
				const o = officers[0]
				const text = typeof o.text === "undefined" ? o.value : o.text
				const newItem = { color: "yellow", text, value: o.value }

				const departmentOptions = await fetchDepartments({ q: o.departmentName })
				setDepartmentOptions(departmentOptions)
				setDepartment(o.departmentId)

				setOfficerOptions([newItem, ...officerOptions])
				setSelectedOfficers([newItem, ...selectedOfficers])
			}
		}
	}

	const handleAddition = (e, { value }) => {
		setOfficer([...officer, value])
		const newItem = { color: "yellow", text: value, value }
		setOfficerOptions([newItem, ...officerOptions])
		setSelectedOfficers([newItem, ...selectedOfficers])
	}

	const titleField = (
		<Input
			inverted={inverted}
			onChange={(e, { value }) => setTitle(value)}
			placeholder="Title"
			value={title}
		/>
	)

	const descriptionField = (
		<TextArea
			onChange={(e, { value }) => setDescription(value)}
			placeholder="Describe this interaction"
			rows={7}
			value={description}
		/>
	)

	const departmentField = (
		<Dropdown
			fluid
			noResultsMessage={null}
			onChange={selectDepartment}
			onSearchChange={changeDepartment}
			options={departmentOptions}
			placeholder="Police Department"
			search
			selection
			upward
			value={department}
		/>
	)

	const officerField = (
		<Dropdown
			allowAdditions={false}
			closeOnChange
			fluid
			multiple
			noResultsMessage={null}
			onAddItem={handleAddition}
			onChange={selectOfficer}
			onClick={() => setOfficersClicked(true)}
			onSearchChange={changeOfficer}
			options={officerOptions}
			placeholder="Officers Involved (Optional)"
			renderLabel={renderLabel}
			search
			selection
			upward
			value={officer}
		/>
	)

	const hasOfficers = interaction.data.officers.length > 0

	let seo = {
		description: "Help document police brutality",
		image: {
			height: 500,
			src: `${s3BaseUrl}logos/logo.png`,
			width: 500
		},
		title: "Add an Ineraction"
	}

	if (!createMode) {
		seo = {
			description:
				initialInteraction.data.description === ""
					? `This is an interaction between a civilian and the ${initialInteraction.data.department.name}`
					: initialInteraction.data.description,
			image: {
				height: 500,
				src: initialInteraction.data.img,
				width: 500
			},
			title: initialInteraction.data.title,
			video: {
				height: 500,
				src: initialInteraction.data.video,
				width: 500
			}
		}
	}

	seo.url = `interactions/${slug}`

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem={slug === "create" ? "addInteraction" : "interactions"}
				containerClassName="interactionsPage"
				loading={loading}
				seo={seo}
				showFooter={false}
			>
				{createMode && (
					<Container>
						<Header as="h1" inverted={inverted} size="huge">
							Add an interaction
						</Header>

						<Segment className="uploadSegment" inverted={inverted}>
							{interaction.data.video === null ? (
								<Segment basic inverted={inverted} padded="very" placeholder>
									<Header as="h1" icon size="huge">
										<Icon color="yellow" inverted name="film" />
									</Header>
									<Dropzone onDrop={onDrop}>
										{({ getRootProps, getInputProps }) => (
											<div className="fileUploadWrapper" {...getRootProps()}>
												<input
													className="fileUploadInput"
													{...getInputProps()}
												/>
												<Button
													color="yellow"
													content="Upload a video"
													inverted={inverted}
													loading={loading}
												/>
											</div>
										)}
									</Dropzone>
								</Segment>
							) : (
								<div className="videoPlayer">
									<ReactPlayer
										controls
										height="100%"
										muted
										playing
										url={interaction.data.video}
										width="100%"
									/>
								</div>
							)}

							<div id="optionalInteractionUpload">
								<Divider horizontal inverted={inverted}>
									<Header as="h2" inverted={inverted}>
										OR
									</Header>
								</Divider>

								<VideoInput
									onPasteInstagram={({
										thumbnail,
										video
									}: {
										thumbnail: string,
										video: string
									}) => setVideo({ thumbnail, video })}
									onPasteYouTube={({
										thumbnail,
										video
									}: {
										thumbnail: string,
										video: string
									}) => setVideo({ thumbnail, video })}
									setLoading={setLoading}
								/>
							</div>
						</Segment>

						{interaction.data.video !== null && (
							<Form
								error={interaction.error}
								inverted={inverted}
								size="big"
								style={{ marginTop: "24px" }}
							>
								<Form.Field>{titleField}</Form.Field>
								<Form.Field>{descriptionField}</Form.Field>
								<Form.Field>{departmentField}</Form.Field>
								<Form.Field>{officerField}</Form.Field>
							</Form>
						)}

						<Divider inverted={inverted} section />

						<Button
							color="yellow"
							content="Add"
							disabled={interaction.data.video === null}
							fluid
							inverted={inverted}
							loading={formLoading}
							onClick={addInteraction}
							size="big"
						/>
					</Container>
				)}

				{!createMode && (
					<Fragment>
						{initialInteraction.error ? (
							<Container className="errorMsgContainer" textAlign="center">
								<Header as="h1" inverted={inverted}>
									This interaction does not exist
									<div />
									<Button
										color="yellow"
										content="Browse all interactions"
										inverted={inverted}
										onClick={() => router.push(`/interactions`)}
									/>
								</Header>
							</Container>
						) : (
							<Container>
								{interaction.loading ? (
									<Container textAlign="center">
										<Dimmer active className="pageDimmer">
											<Loader active size="huge" />
										</Dimmer>
									</Container>
								) : (
									<Fragment>
										<Header as="h1" inverted={inverted}>
											{initialInteraction.data.title}
											<Header.Subheader>
												<Moment
													date={initialInteraction.data.createdAt}
													fromNow
												/>{" "}
												• By{" "}
												<Link
													href={`/${initialInteraction.data.user.username}`}
												>
													<a>{initialInteraction.data.user.name}</a>
												</Link>{" "}
												• {initialInteraction.data.views} views
											</Header.Subheader>
										</Header>

										<ReactPlayer
											controls
											height="100%"
											muted
											playing
											style={{ lineHeight: 0.8 }}
											url={initialInteraction.data.video}
											width="100%"
										/>

										<Header as="h2" inverted>
											About
											{user.id === interaction.data.user.id && (
												<Button
													color={editMode ? "red" : "yellow"}
													compact
													content={editMode ? "Cancel" : "Edit"}
													floated="right"
													icon={editMode ? "close" : "pencil"}
													inverted
													onClick={() => {
														setEditMode(!editMode)
													}}
												/>
											)}
										</Header>
										<Segment className="lighter" inverted={inverted} size="big">
											{editMode ? (
												<Form inverted={inverted} size="big">
													{descriptionField}
												</Form>
											) : (
												<Fragment>
													{typeof interaction.data.description ===
														"undefined" ||
													interaction.data.description === null ||
													interaction.data.description === "" ? (
														"No description"
													) : (
														<LinkedText
															text={interaction.data.description}
														/>
													)}
												</Fragment>
											)}
										</Segment>

										<Header as="h2" inverted>
											Police Department
										</Header>
										<Segment className="lighter" inverted={inverted}>
											{editMode ? (
												<Form size="big">
													<Form.Field>{departmentField}</Form.Field>
												</Form>
											) : (
												<List
													inverted={inverted}
													selection
													size="big"
													verticalAlign="middle"
												>
													<List.Item
														onClick={() =>
															router.push(
																`/departments/${interaction.data.department.slug}`
															)
														}
													>
														<List.Content>
															<List.Header>
																{interaction.data.department.name}
															</List.Header>
														</List.Content>
													</List.Item>
												</List>
											)}
										</Segment>

										<Header as="h2" inverted>
											Officers Involved
										</Header>
										<Segment
											className="lighter"
											inverted={inverted}
											size={hasOfficers ? "large" : "big"}
										>
											{hasOfficers ? (
												<Fragment>
													<List
														className="interaction officersList"
														inverted={inverted}
														selection
														size="big"
														verticalAlign="middle"
													>
														{interaction.data.officers.map(
															(officer) => (
																<List.Item
																	key={`officerInvolved${officer.slug}`}
																	onClick={() =>
																		router.push(
																			`/officers/${officer.slug}`
																		)
																	}
																>
																	<Image
																		onError={(i) =>
																			(i.target.src = DefaultPic)
																		}
																		rounded
																		size="tiny"
																		src={
																			officer.img === null
																				? DefaultPic
																				: `${s3BaseUrl}${officer.img}`
																		}
																	/>
																	<List.Content verticalAlign="top">
																		<List.Header>
																			{officer.firstName}{" "}
																			{officer.lastName}
																		</List.Header>
																		<List.Description>
																			{officer.departmentName}
																		</List.Description>
																	</List.Content>
																</List.Item>
															)
														)}
													</List>
													{editMode && (
														<Form size="big">{officerField}</Form>
													)}
												</Fragment>
											) : (
												<div>
													<p>
														The officer(s) in this video have not been
														identified. Can you help us spot them?
													</p>
													{officerField}
													<Divider horizontal inverted={inverted}>
														<Header inverted={inverted}>OR</Header>
													</Divider>
													<p>
														Don&apos;t see the officer you&apos;re
														looking for? Add them.
													</p>
													<Button
														color="orange"
														content="Add an officer"
														fluid
														inverted={inverted}
														onClick={() =>
															router.push(
																`/officers/create?departmentId=${interaction.data.department.id}`
															)
														}
														size="big"
													/>
												</div>
											)}
										</Segment>

										{(editMode || (!hasOfficers && officersClicked)) && (
											<Fragment>
												<Button
													color="yellow"
													content="Save"
													fluid
													inverted={inverted}
													onClick={() =>
														updateInteraction({
															bearer,
															callback: async (id: number) => {
																await getInteraction({ id })
																setEditMode(false)
															},
															department,
															description,
															id: interaction.data.id,
															officer: selectedOfficers
														})
													}
													size="big"
												/>
											</Fragment>
										)}

										<Header as="h2" inverted size="huge">
											Comments
										</Header>
										<Comments
											authenticated={authenticated}
											bearer={bearer}
											comments={interaction.comments}
											interactionId={interaction.data.id}
											highlighted={typeof commentId !== undefined}
											highlightedCommentId={commentId}
											highlightedReplyId={replyId}
											inverted={inverted}
											likeComment={({ bearer, commentId, responseId }) =>
												likeComment({ bearer, commentId, responseId })
											}
											loadMoreComments={({ interactionId, page }) =>
												getComments({ interactionId, page })
											}
											postComment={({
												bearer,
												callback,
												interactionId,
												message,
												responseTo
											}) =>
												postComment({
													bearer,
													callback,
													interactionId,
													message,
													responseTo
												})
											}
											unlikeComment={({ bearer, commentId, responseId }) =>
												unlikeComment({ bearer, commentId, responseId })
											}
											userId={user.id}
										/>

										<Header
											as="h3"
											className="moreInteractionsHeader"
											content="More Interactions"
											inverted={inverted}
											size="huge"
										/>

										{!interaction.error && !interaction.loading && (
											<SearchResults
												hasMore={interactions.hasMore}
												inverted={inverted}
												justImages
												loading={interactions.loading}
												loadMore={({
													exclude,
													page
												}: {
													exclude: number[],
													page: number
												}) => loadMore(exclude, page)}
												page={interactions.page}
												results={interactions.results}
												type="interactions"
											/>
										)}
									</Fragment>
								)}
							</Container>
						)}
					</Fragment>
				)}
			</DefaultLayout>
		</Provider>
	)
}

Interaction.propTypes = {
	createInteraction: PropTypes.func,
	getComments: PropTypes.func,
	getInteraction: PropTypes.func,
	initialInteraction: PropTypes.shape({
		data: PropTypes.shape({
			createdAt: PropTypes.string,
			department: PropTypes.shape({
				id: PropTypes.number,
				name: PropTypes.string,
				slug: PropTypes.string
			}),
			description: PropTypes.string,
			id: PropTypes.number,
			officers: PropTypes.arrayOf(
				PropTypes.shape({
					departmentName: PropTypes.string,
					firstName: PropTypes.string,
					id: PropTypes.number,
					img: PropTypes.string,
					lastName: PropTypes.string,
					slug: PropTypes.string
				})
			),
			thumbnail: PropTypes.string,
			title: PropTypes.string,
			user: PropTypes.shape({
				id: PropTypes.number,
				img: PropTypes.string,
				name: PropTypes.string,
				username: PropTypes.string
			}),
			video: PropTypes.string,
			views: PropTypes.number
		}),
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
		loading: PropTypes.bool
	}),
	interaction: PropTypes.shape({
		comments: PropTypes.shape({
			error: PropTypes.bool,
			errorMsg: PropTypes.string,
			hasMore: PropTypes.bool,
			loading: PropTypes.bool,
			page: PropTypes.number,
			results: PropTypes.arrayOf(
				PropTypes.shape({
					createdAt: PropTypes.string,
					interactionId: PropTypes.number,
					likeCount: PropTypes.number,
					likedByMe: PropTypes.number,
					message: PropTypes.string,
					respones: PropTypes.arrayOf(
						PropTypes.shape({
							createdAt: PropTypes.string,
							id: PropTypes.number,
							likeCount: PropTypes.number,
							likedByMe: PropTypes.number,
							message: PropTypes.string,
							userImg: PropTypes.string,
							userName: PropTypes.string,
							userUsername: PropTypes.string
						})
					),
					responseTo: PropTypes.number,
					updatedAt: PropTypes.string,
					userImg: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
					userName: PropTypes.string,
					userUsername: PropTypes.string
				})
			)
		}),
		data: PropTypes.shape({
			createdAt: PropTypes.string,
			department: PropTypes.shape({
				id: PropTypes.number,
				name: PropTypes.string,
				slug: PropTypes.string
			}),
			description: PropTypes.string,
			id: PropTypes.number,
			officers: PropTypes.arrayOf(
				PropTypes.shape({
					departmentName: PropTypes.string,
					firstName: PropTypes.string,
					id: PropTypes.number,
					img: PropTypes.string,
					lastName: PropTypes.string,
					slug: PropTypes.string
				})
			),
			thumbnail: PropTypes.string,
			title: PropTypes.string,
			user: PropTypes.shape({
				id: PropTypes.number,
				img: PropTypes.string,
				name: PropTypes.string,
				username: PropTypes.string
			}),
			video: PropTypes.string,
			views: PropTypes.number
		}),
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
		loading: PropTypes.bool
	}),
	interactions: PropTypes.shape({
		hasMore: PropTypes.bool,
		loading: PropTypes.bool,
		page: PropTypes.number,
		results: PropTypes.arrayOf(
			PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.shape({
					createdAt: PropTypes.string,
					description: PropTypes.string,
					video: PropTypes.string
				})
			])
		)
	}),
	inverted: PropTypes.bool,
	likeComment: PropTypes.func,
	postComment: PropTypes.func,
	searchInteractions: PropTypes.func,
	setVideo: PropTypes.func,
	unlikeComment: PropTypes.func,
	updateInteraction: PropTypes.func,
	updateViews: PropTypes.func,
	uploadVideo: PropTypes.func
}

Interaction.defaultProps = {
	createInteraction,
	getComments,
	getInteraction,
	interaction: {
		comments: {
			error: false,
			errorMsg: "",
			hasMore: false,
			loading: true,
			results: []
		},
		data: {
			department: {},
			officers: [],
			user: {},
			video: null
		},
		error: false,
		errorMsg: "",
		loading: true
	},
	interactions: {
		hasMore: false,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	},
	likeComment,
	postComment,
	searchInteractions,
	setVideo,
	unlikeComment,
	updateInteraction,
	updateViews,
	uploadVideo
}

const mapStateToProps = (state: RootState, ownProps: InitialPageState) => ({
	...state.interaction,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		createInteraction,
		getComments,
		getInteraction,
		likeComment,
		postComment,
		searchInteractions,
		setVideo,
		unlikeComment,
		updateInteraction,
		updateViews,
		uploadVideo
	}),
	withTheme("dark")
)(Interaction)
