import {
	createInteraction,
	getInteraction,
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
import { Provider, connect } from "react-redux"
import { fetchDepartments } from "@options/departments"
import { fetchOfficers } from "@options/officers"
import { s3BaseUrl } from "@options/config"
import { useRouter } from "next/router"
import { parseJwt } from "@utils/tokenFunctions"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import DefaultPic from "@public/images/avatar/officer.png"
import Dropzone from "react-dropzone"
import Link from "next/link"
import LinkedText from "@components/linkedText"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { useEffect, useState, Fragment } from "react"
import ReactPlayer from "react-player"
import store from "@store"

const Interaction: React.FunctionComponent = ({
	createInteraction,
	interaction,
	getInteraction,
	inverted,
	updateInteraction,
	updateViews,
	uploadVideo
}) => {
	const router = useRouter()
	const { departmentId, officerId, slug } = router.query

	const [bearer, setBearer] = useState(null)
	const [createMode, setCreateMode] = useState(false)
	const [department, setDepartment] = useState("")
	const [departmentOptions, setDepartmentOptions] = useState([])
	const [description, setDescription] = useState(interaction.data.description)
	const [editMode, setEditMode] = useState(false)
	const [formLoading, setFormLoading] = useState(false)
	const [loading, setLoading] = useState(false)
	const [officer, setOfficer] = useState([])
	const [officerOptions, setOfficerOptions] = useState([])
	const [selectedOfficers, setSelectedOfficers] = useState([])
	const [title, setTitle] = useState("")
	const [user, setUser] = useState({})

	useEffect(() => {
		const getInitialProps = async () => {
			if (slug === "create") {
				setCreateMode(true)

				let departmentOptions = []
				if (typeof departmentId !== "undefined") {
					departmentOptions = await fetchDepartments({ id: departmentId })
					setDepartmentOptions(departmentOptions)
					setDepartment(parseInt(departmentId, 10))
				} else {
					departmentOptions = await fetchDepartments({ q: "" })
					setDepartmentOptions(departmentOptions)
				}

				const officerOptions = await fetchOfficers({ departentId: departmentId })
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
					callback: async (departmentId, description, officers) => {
						updateViews({ id: slug })
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
			title
		})
	}

	const changeDepartment = async (e) => {
		const q = e.target.value
		const departmentOptions = await fetchDepartments({ q })
		setDepartmentOptions(departmentOptions)
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
			allowAdditions
			closeOnChange
			fluid
			multiple
			noResultsMessage={null}
			onAddItem={handleAddition}
			onChange={selectOfficer}
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

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem="interactions"
				containerClassName="interactionsPage"
				loading={loading}
				seo={{
					description: `A `,
					image: {
						height: 200,
						src: "",
						width: 200
					},
					title: createMode ? "Add an interaction" : interaction.data.title,
					url: `interactions`
				}}
				showFooter={false}
			>
				{createMode && (
					<Container>
						<Header as="h1" inverted={inverted} size="huge">
							Add an interaction
						</Header>

						{interaction.data.video === null ? (
							<Segment inverted={inverted} padded="very" placeholder>
								<Header as="h1" icon size="huge">
									<Icon color="yellow" inverted name="film" />
								</Header>
								<Dropzone onDrop={onDrop}>
									{({ getRootProps, getInputProps }) => (
										<div {...getRootProps()}>
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

						<Divider inverted={inverted} section />

						<Button
							color="yellow"
							content="Add"
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
						{interaction.error ? (
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
											<Loader active size="huge">
												Loading
											</Loader>
										</Dimmer>
									</Container>
								) : (
									<Fragment>
										<Header as="h1" inverted={inverted}>
											{interaction.data.title}
											<Header.Subheader>
												Submitted{" "}
												<Moment date={interaction.data.createdAt} fromNow />{" "}
												•{" "}
												<Link href={`/${interaction.data.user.username}`}>
													<a>{interaction.data.user.name}</a>
												</Link>{" "}
												• {interaction.data.views} views
											</Header.Subheader>
										</Header>

										<ReactPlayer
											controls
											height="100%"
											muted
											onReady={(e) => console.log("e", e)}
											playing
											style={{ lineHeight: 0.8 }}
											url={interaction.data.video}
											width="100%"
										/>

										<Header as="h2" inverted>
											About this interaction
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
										<Segment inverted={inverted} size="big">
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
										<Segment inverted={inverted}>
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
											inverted={inverted}
											size={hasOfficers ? "medium" : "big"}
										>
											{hasOfficers ? (
												<Fragment>
													<List
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
												</div>
											)}
										</Segment>

										<Divider inverted={inverted} section />

										{(editMode || !hasOfficers) && (
											<Button
												color="yellow"
												content="Save"
												fluid
												inverted={inverted}
												onClick={() =>
													updateInteraction({
														bearer,
														callback: async (id) => {
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
	getInteraction: PropTypes.func,
	interaction: PropTypes.shape({
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
	inverted: PropTypes.bool,
	updateInteraction: PropTypes.func,
	updateViews: PropTypes.func,
	uploadVideo: PropTypes.func
}

Interaction.defaultProps = {
	createInteraction,
	getInteraction,
	interaction: {
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
	updateInteraction,
	updateViews,
	uploadVideo
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.interaction,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		createInteraction,
		getInteraction,
		updateInteraction,
		updateViews,
		uploadVideo
	}),
	withTheme("dark")
)(Interaction)
