import { createInteraction, getInteraction, updateViews, uploadVideo } from "@actions/interaction"
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
import { useRouter, Router } from "next/router"
import { parseJwt } from "@utils/tokenFunctions"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import Dropzone from "react-dropzone"
import Link from "next/link"
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
	updateViews,
	uploadVideo
}) => {
	const router = useRouter()
	const { departmentId, slug } = router.query

	const [bearer, setBearer] = useState(null)
	const [createMode, setCreateMode] = useState(false)
	const [department, setDepartment] = useState("")
	const [departmentOptions, setDepartmentOptions] = useState([])
	const [description, setDescription] = useState("")
	const [formLoading, setFormLoading] = useState(false)
	const [loading, setLoading] = useState(false)
	const [officer, setOfficer] = useState([])
	const [officerOptions, setOfficerOptions] = useState([])
	const [selectedOfficers, setSelectedOfficers] = useState([])
	const [title, setTitle] = useState("")

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

				const officerOptions = await fetchOfficers({ departentId: departmentId, q: "" })
				setOfficerOptions(officerOptions)
			}

			if (typeof slug !== "undefined" && slug !== "create") {
				setCreateMode(false)
				await getInteraction({ id: slug })
				updateViews({ id: slug })
			}
		}

		getInitialProps()
	}, [slug])

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setBearer(localStorage.getItem("jwtToken"))
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
		setDepartment(value)
		const officerOptions = await fetchOfficers({ departmentId: value })
		setOfficerOptions(officerOptions)
	}

	const changeOfficer = async (e) => {
		const q = e.target.value
		const officerOptions = await fetchOfficers({ departmentId: department, q })
		setOfficerOptions([...selectedOfficers, ...officerOptions])
	}

	const selectOfficer = async (e, { value }) => {
		setOfficer(value)

		const officer = await officerOptions.filter(
			(officer) => officer.value === value[value.length - 1]
		)

		if (officer.length > 0) {
			const o = officer[0]
			const text = typeof o.text === "undefined" ? o.value : o.text
			const newItem = { color: "yellow", text, value: o.value }

			const departmentOptions = await fetchDepartments({ q: o.departmentName })
			setDepartmentOptions(departmentOptions)
			setDepartment(o.departmentId)

			setOfficerOptions([newItem, ...officerOptions])
			setSelectedOfficers([newItem, ...selectedOfficers])
		}
	}

	const handleAddition = (e, { value }) => {
		setOfficer([...officer, value])
		const newItem = { color: "yellow", text: value, value }
		setOfficerOptions([newItem, ...officerOptions])
		setSelectedOfficers([newItem, ...selectedOfficers])
	}

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
									onReady={(e) => console.log("e", e)}
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
							<Form.Field>
								<Input
									inverted={inverted}
									onChange={(e, { value }) => setTitle(value)}
									placeholder="Title"
									value={title}
								/>
							</Form.Field>
							<Form.Field>
								<TextArea
									onChange={(e, { value }) => setDescription(value)}
									placeholder="Describe this interaction"
									rows={7}
									value={description}
								/>
							</Form.Field>
							<Form.Field>
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
							</Form.Field>
							<Form.Field>
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
							</Form.Field>
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
							<Fragment>
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
										<div className="videoPlayer">
											<ReactPlayer
												controls
												height="100%"
												muted
												onReady={(e) => console.log("e", e)}
												playing
												url={interaction.data.video}
												width="100%"
											/>
										</div>
										<div className="videoBasicInfo">
											<Header
												as="h1"
												className="videoTitle"
												inverted
												size="huge"
											>
												{interaction.data.title}
												<Header.Subheader>
													<Moment
														date={interaction.data.createdAt}
														fromNow
													/>{" "}
													•{" "}
													<Link
														href={`/${interaction.data.user.username}`}
													>
														<a>{interaction.data.user.name}</a>
													</Link>{" "}
													• {interaction.data.views} views
												</Header.Subheader>
											</Header>
											<p className="videoDescription">
												{interaction.data.description}
											</p>
										</div>
										<Divider inverted={inverted} section />
										<div className="videoBasicInfo">
											<Header as="h2" inverted>
												Officers Involved
											</Header>
											{interaction.data.officers.length > 0 ? (
												<List
													inverted={inverted}
													selection
													size="big"
													verticalAlign="middle"
												>
													{interaction.data.officers.map((officer) => (
														<List.Item
															key={`officerInvolved${officer.slug}`}
															onClick={() =>
																router.push(
																	`/officers/${officer.slug}`
																)
															}
														>
															<Image
																avatar
																src="/images/avatar/small/rachel.png"
															/>
															<List.Content>
																<List.Header>
																	{officer.firstName}{" "}
																	{officer.lastName}
																</List.Header>
																<List.Description>
																	{
																		interaction.data.department
																			.name
																	}
																</List.Description>
															</List.Content>
														</List.Item>
													))}
												</List>
											) : (
												<div>
													<p>
														The officer(s) in this video have not been
														identified. Can you help us spot them?
													</p>
												</div>
											)}
										</div>
									</Fragment>
								)}
							</Fragment>
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
			officers: PropTypes.arrayOf(
				PropTypes.shape({
					firstName: PropTypes.string,
					id: PropTypes.number,
					img: PropTypes.string,
					lastName: PropTypes.string,
					slug: PropTypes.string
				})
			),
			title: PropTypes.string,
			user: PropTypes.shape({
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
		updateViews,
		uploadVideo
	}),
	withTheme("dark")
)(Interaction)
