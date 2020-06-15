import { searchInteractions } from "@actions/interaction"
import { createOfficer, getOfficer } from "@actions/officer"
import {
	Button,
	Container,
	Divider,
	Dropdown,
	Form,
	Grid,
	Header,
	Image,
	Input,
	Message,
	Placeholder
} from "semantic-ui-react"
import { parseJwt } from "@utils/tokenFunctions"
import { Provider, connect } from "react-redux"
import { fetchDepartments } from "@options/departments"
import { useRouter } from "next/router"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import DefaultPic from "@public/images/placeholders/placeholder-dark.jpg"
import PropTypes from "prop-types"
import React, { useEffect, useState, Fragment } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const Officer: React.FunctionComponent = ({
	createOfficer,
	officer,
	getOfficer,
	inverted,
	searchInteractions
}) => {
	const router = useRouter()
	const { slug } = router.query

	const [bearer, setBearer] = useState(null)
	const [createMode, setCreateMode] = useState(null)
	const [currentUser, setCurrentUser] = useState({})
	const [department, setDepartment] = useState("")
	const [departmentOptions, setDepartmentOptions] = useState([])
	const [firstName, setFirstName] = useState("")
	const [formLoading, setFormLoading] = useState(false)
	const [lastName, setLastName] = useState("")

	useEffect(() => {
		const getInitialProps = async () => {
			const userData = parseJwt()
			if (userData) {
				setBearer(localStorage.getItem("jwtToken"))
				setCurrentUser(userData)
			}

			if (slug === "create") {
				setCreateMode(true)
				const departmentOptions = await fetchDepartments("")
				setDepartmentOptions(departmentOptions)
			}

			if (typeof slug !== "undefined" && slug !== "create") {
				await getOfficer({ id: slug })
				await searchInteractions({})
				setCreateMode(false)
			}
		}

		getInitialProps()
	}, [slug])

	const addOfficer = () => {
		setFormLoading(true)
		createOfficer({
			bearer,
			callback: () => setFormLoading(false),
			department,
			firstName,
			lastName
		})
	}

	const changeDepartment = async (e) => {
		const q = e.target.value
		const departmentOptions = await fetchDepartments(q)
		setDepartmentOptions(departmentOptions)
	}

	const selectDepartment = (e, { value }) => {
		setDepartment(value)
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				containerClassName="officersPage"
				seo={{
					description: `A `,
					image: {
						height: 200,
						src: "",
						width: 200
					},
					title: createMode
						? "Add an officer"
						: `${officer.data.firstName} ${officer.data.lastName}`,
					url: `officers/${slug}`
				}}
				showFooter={false}
			>
				{createMode && (
					<Container>
						<Header as="h1" inverted={inverted} size="huge">
							Add a new officer
						</Header>

						<Form
							error={officer.error}
							inverted={inverted}
							size="big"
							style={{ marginTop: "24px" }}
						>
							<Form.Group widths="equal">
								<Form.Field>
									<label>First name</label>
									<Input
										onChange={(e, { value }) => setFirstName(value)}
										placeholder="First name"
										value={firstName}
									/>
								</Form.Field>
								<Form.Field>
									<label>Last name</label>
									<Input
										onChange={(e, { value }) => setLastName(value)}
										placeholder="Last name"
										value={lastName}
									/>
								</Form.Field>
							</Form.Group>
							<Form.Field>
								<label>Department</label>
								<Dropdown
									onChange={selectDepartment}
									onSearchChange={changeDepartment}
									options={departmentOptions}
									placeholder="Name of department"
									search
									selection
									value={department}
								/>
							</Form.Field>
						</Form>

						{officer.error && (
							<Message
								content={officer.errorMsg}
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
							onClick={addOfficer}
							size="big"
						/>
					</Container>
				)}

				{createMode === false && (
					<Fragment>
						{officer.error ? (
							<Container className="errorMsgContainer" textAlign="center">
								<Header as="h1" inverted={inverted}>
									This officer does not exist
									<div />
									<Button
										color="blue"
										content="Search all officers"
										inverted={inverted}
										onClick={() => router.push(`/officers`)}
									/>
								</Header>
							</Container>
						) : (
							<Fragment>
								<Grid>
									<Grid.Row>
										<Grid.Column width={4}>
											{officer.loading ? (
												<Placeholder inverted={inverted}>
													<Placeholder.Image square />
												</Placeholder>
											) : (
												<Image
													onError={(i) => (i.target.src = DefaultPic)}
													src={officer.data.img}
												/>
											)}
										</Grid.Column>
										<Grid.Column width={12}>
											{!officer.loading && (
												<Fragment>
													<Header as="h1" inverted={inverted}>
														{officer.data.firstName}{" "}
														{officer.data.lastName}
														<Header.Subheader>
															{officer.data.departmentName}
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
																	`/interactions/create?deparmentId=${department.data.id}`
																)
															}
														/>
													</div>
												</Fragment>
											)}
										</Grid.Column>
									</Grid.Row>
								</Grid>

								<Divider section />

								{!officer.error && !officer.loading ? (
									<SearchResults
										hasMore={officer.interactions.hasMore}
										inverted={inverted}
										loading={officer.interactions.loading}
										loadMore={({ page, userId }) => loadMore(page, userId)}
										page={officer.interactions.page}
										results={officer.interactions.results}
										type="interactions"
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

Officer.propTypes = {
	createOfficer: PropTypes.func,
	getOfficer: PropTypes.func,
	inverted: PropTypes.bool,
	officer: PropTypes.shape({
		data: PropTypes.shape({
			createdAt: PropTypes.string,
			departmentId: PropTypes.number,
			departmentName: PropTypes.string,
			firstName: PropTypes.string,
			id: PropTypes.number,
			img: PropTypes.string,
			interactionCount: PropTypes.number,
			lastName: PropTypes.string,
			position: PropTypes.string
		}),
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
		interactions: PropTypes.shape({
			error: PropTypes.bool,
			errorMsg: PropTypes.string,
			hasMore: PropTypes.bool,
			loading: PropTypes.bool,
			results: PropTypes.arrayOf(
				PropTypes.shape({
					createdAt: PropTypes.string,
					description: PropTypes.string,
					officer: PropTypes.shape({
						name: PropTypes.name
					})
				})
			)
		}),
		loading: PropTypes.bool
	}),
	searchInteractions: PropTypes.func
}

Officer.defaultProps = {
	createOfficer,
	officer: {
		data: {},
		error: false,
		errorMsg: "",
		interactions: {
			error: false,
			errorMsg: "",
			hasMore: false,
			loading: true,
			results: []
		},
		loading: true
	},
	getOfficer,
	searchInteractions
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.officer,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		createOfficer,
		getOfficer,
		searchInteractions
	}),
	withTheme("dark")
)(Officer)
