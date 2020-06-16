import { createInteraction, getInteraction } from "@actions/interaction"
import {
	Button,
	Container,
	Divider,
	Dropdown,
	Form,
	Grid,
	Header,
	Icon,
	Input,
	List,
	Message,
	Placeholder,
	Segment,
	TextArea
} from "semantic-ui-react"
import { Provider, connect } from "react-redux"
import { fetchDepartments } from "@options/departments"
import { fetchOfficers } from "@options/officers"
import { useRouter } from "next/router"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import MapBox from "@components/mapBox"
import PropTypes from "prop-types"
import React, { useEffect, useState, Fragment } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const Interaction: React.FunctionComponent = ({
	createInteraction,
	interaction,
	getInteraction,
	inverted
}) => {
	const router = useRouter()
	const { slug } = router.query

	const [createMode, setCreateMode] = useState(false)
	const [department, setDepartment] = useState("")
	const [departmentOptions, setDepartmentOptions] = useState([])
	const [description, setDescription] = useState("")
	const [formLoading, setFormLoading] = useState(false)
	const [officer, setOfficer] = useState([])
	const [officerOptions, setOfficerOptions] = useState([])
	const [title, setTitle] = useState("")

	useEffect(() => {
		const getInitialProps = async () => {
			if (slug === "create") {
				setCreateMode(true)

				const officerOptions = await fetchOfficers(department, "")
				setOfficerOptions(officerOptions)

				const departmentOptions = await fetchDepartments("")
				setDepartmentOptions(departmentOptions)
			}

			if (typeof slug !== "undefined" && slug !== "create") {
				await getInteraction({ id: slug })
				setCreateMode(false)
			}
		}

		getInitialProps()
	}, [slug])

	const addInteraction = () => {
		setFormLoading(true)
		createInteraction({ callback: () => setFormLoading(false), city, name })
	}

	const changeDepartment = async (e) => {
		const q = e.target.value
		const departmentOptions = await fetchDepartments(q)
		setDepartmentOptions(departmentOptions)
	}

	const changeOfficer = async (e) => {
		const q = e.target.value
		const officerOptions = await fetchOfficers(q)
		setOfficerOptions(officerOptions)
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
				containerClassName="interactionsPage"
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

						<Segment inverted={inverted} padded="very" placeholder>
							<Header as="h2" icon size="huge">
								<Icon color="yellow" inverted name="film" />
							</Header>
							<Button color="yellow" content="Upload a video" inverted={inverted} />
						</Segment>

						<Divider inverted={inverted} />

						<Form
							error={interaction.error}
							inverted={inverted}
							size="big"
							style={{ marginTop: "24px" }}
						>
							<Form.Field>
								<label>Title</label>
								<Input
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
									value={description}
								/>
							</Form.Field>
							<Form.Group widths="equal">
								<Form.Field>
									<label>Officers involved</label>
									<Dropdown
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
							color="blue"
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
								<Grid>
									<Grid.Row>
										<Grid.Column width={4}>
											{interaction.loading ? (
												<Placeholder inverted={inverted}>
													<Placeholder.Image square />
												</Placeholder>
											) : (
												<Fragment>
													<MapBox
														lat={parseFloat(interaction.data.lat, 10)}
														lng={parseFloat(interaction.data.lon, 10)}
														zoom={interaction.data.type === 1 ? 4 : 9}
													/>
												</Fragment>
											)}
										</Grid.Column>
										<Grid.Column width={12}>
											{!interaction.loading && (
												<Fragment>
													<Header as="h1" inverted={inverted}>
														{interaction.data.name}
														<Header.Subheader>
															{interaction.data.type === 1 && (
																<Fragment>
																	{interaction.data.state}
																</Fragment>
															)}
															{interaction.data.type === 2 && (
																<Fragment>
																	{interaction.data.city},{" "}
																	{interaction.data.state}
																</Fragment>
															)}
															{interaction.data.type === 3 && (
																<Fragment>
																	{interaction.data.county}{" "}
																	County, {interaction.data.state}
																</Fragment>
															)}
														</Header.Subheader>
													</Header>

													<div style={{ marginTop: "22px" }}>
														<Button
															color="yellow"
															compact
															content="Interaction"
															icon="plus"
															inverted={inverted}
															onClick={() =>
																router.push(
																	`/interactions/create?deparmentId=${interaction.data.id}`
																)
															}
														/>
														<Button
															color="orange"
															compact
															content="Officer"
															icon="plus"
															inverted={inverted}
															onClick={() =>
																router.push(
																	`/officers/create?deparmentId=${interaction.data.id}`
																)
															}
															style={{ marginLeft: "7px" }}
														/>
													</div>

													<List
														className="gridList"
														horizontal
														inverted={inverted}
														size="big"
													>
														<List.Item
															active={activeItem === "officers"}
															onClick={() =>
																setActiveItem("officers")
															}
														>
															<b>{interaction.data.officerCount}</b>{" "}
															officers
														</List.Item>
														<List.Item
															active={activeItem === "interactions"}
															onClick={() =>
																setActiveItem("interactions")
															}
														>
															<b>
																{interaction.data.interactionCount}
															</b>{" "}
															interactions
														</List.Item>
													</List>
												</Fragment>
											)}
										</Grid.Column>
									</Grid.Row>
								</Grid>

								<Divider section />

								{!interaction.error && !interaction.loading ? (
									<SearchResults
										hasMore={results.hasMore}
										inverted={inverted}
										loading={results.loading}
										loadMore={({ page, userId }) => loadMore(page, userId)}
										page={results.page}
										results={results.results}
										type={activeItem}
									/>
								) : null}
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
			city: PropTypes.string,
			county: PropTypes.string,
			id: PropTypes.number,
			interactionCount: PropTypes.number,
			lat: PropTypes.string,
			lon: PropTypes.string,
			name: PropTypes.string,
			officerCount: PropTypes.number,
			state: PropTypes.string,
			type: PropTypes.number
		}),
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
		loading: PropTypes.bool
	}),
	inverted: PropTypes.bool
}

Interaction.defaultProps = {
	createInteraction,
	getInteraction,
	interaction: {
		data: {},
		error: false,
		errorMsg: "",
		loading: true
	}
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.department,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		createInteraction,
		getInteraction
	}),
	withTheme("dark")
)(Interaction)
