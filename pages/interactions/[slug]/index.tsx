import { createInteraction, getInteraction, uploadVideo } from "@actions/interaction"
import {
	Button,
	Container,
	Dimmer,
	Divider,
	Dropdown,
	Form,
	Header,
	Icon,
	Input,
	Loader,
	Message,
	Segment,
	TextArea
} from "semantic-ui-react"
import { Provider, connect } from "react-redux"
import { fetchDepartments } from "@options/departments"
import { fetchOfficers } from "@options/officers"
import { useRouter } from "next/router"
import { parseJwt } from "@utils/tokenFunctions"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import Dropzone from "react-dropzone"
import PropTypes from "prop-types"
import React, { useEffect, useState, Fragment } from "react"
import ReactPlayer from "react-player"
import store from "@store"

const Interaction: React.FunctionComponent = ({
	createInteraction,
	interaction,
	getInteraction,
	inverted,
	uploadVideo
}) => {
	const router = useRouter()
	const { slug } = router.query

	const [bearer, setBearer] = useState(null)
	const [createMode, setCreateMode] = useState(false)
	const [department, setDepartment] = useState("")
	const [departmentOptions, setDepartmentOptions] = useState([])
	const [description, setDescription] = useState("")
	const [formLoading, setFormLoading] = useState(false)
	const [loading, setLoading] = useState(false)
	const [officer, setOfficer] = useState([])
	const [officerOptions, setOfficerOptions] = useState([])
	const [title, setTitle] = useState("")

	useEffect(() => {
		const getInitialProps = async () => {
			if (slug === "create") {
				setCreateMode(true)

				const officerOptions = await fetchOfficers({ departentId: department, q: "" })
				setOfficerOptions(officerOptions)

				const departmentOptions = await fetchDepartments({ q: "" })
				setDepartmentOptions(departmentOptions)
			}

			if (typeof slug !== "undefined" && slug !== "create") {
				await getInteraction({ id: slug })
				setCreateMode(false)
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
			file: files[0],
			officer,
			title
		})
	}

	const changeDepartment = async (e) => {
		const q = e.target.value
		const departmentOptions = await fetchDepartments({ q })
		setDepartmentOptions(departmentOptions)
	}

	const changeOfficer = async (e) => {
		const q = e.target.value
		const officerOptions = await fetchOfficers({ q })
		setOfficerOptions(officerOptions)
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

	const selectDepartment = (e, { value }) => {
		setDepartment(value)
	}

	const selectOfficer = (e, { value }) => {
		setOfficer(value)
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
					title: createMode ? "Add an interaction" : interaction.data.name,
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
											<input {...getInputProps()} />
											<Button
												color="yellow"
												content="Upload a video"
												inverted={inverted}
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
								<label>Title</label>
								<Input
									inverted={inverted}
									onChange={(e, { value }) => setTitle(value)}
									placeholder="Title"
									value={title}
								/>
							</Form.Field>
							<Form.Field>
								<label>Description</label>
								<TextArea
									onChange={(e, { value }) => setDescription(value)}
									placeholder="Describe this interaction"
									rows={7}
									value={description}
								/>
							</Form.Field>
							<Form.Group widths="equal">
								<Form.Field>
									<label>Officers involved</label>
									<Dropdown
										closeOnChange
										fluid
										multiple
										onChange={selectOfficer}
										onSearchChange={changeOfficer}
										options={officerOptions}
										placeholder="Officers involved"
										renderLabel={renderLabel}
										search
										selection
										value={officer}
									/>
								</Form.Field>
								<Form.Field>
									<label>Police Department</label>
									<Dropdown
										fluid
										onChange={selectDepartment}
										onSearchChange={changeDepartment}
										options={departmentOptions}
										placeholder="Police Department"
										search
										selection
										value={department}
									/>
								</Form.Field>
							</Form.Group>
						</Form>

						{interaction.error && (
							<Message
								content={interaction.errorMsg}
								error
								inverted={inverted}
								size="big"
							/>
						)}

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
									This department does not exist
									<div />
									<Button
										color="blue"
										content="Search all departments"
										inverted={inverted}
										onClick={() => router.push(`/departments`)}
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
									<div></div>
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
			department: PropTypes.string,
			description: PropTypes.string,
			officer: PropTypes.string,
			title: PropTypes.string,
			user: PropTypes.shape({
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
	uploadVideo: PropTypes.func
}

Interaction.defaultProps = {
	createInteraction,
	getInteraction,
	interaction: {
		data: {
			user: {},
			video: null
		},
		error: false,
		errorMsg: "",
		loading: true
	},
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
		uploadVideo
	}),
	withTheme("dark")
)(Interaction)
