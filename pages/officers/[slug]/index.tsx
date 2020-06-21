import { searchInteractions } from "@actions/interaction"
import { createOfficer, getOfficer, updateImg } from "@actions/officer"
import {
	Button,
	Container,
	Dimmer,
	Divider,
	Dropdown,
	Form,
	Grid,
	Header,
	Input,
	List,
	Loader
} from "semantic-ui-react"
import { formatPlural } from "@utils/textFunctions"
import { parseJwt } from "@utils/tokenFunctions"
import { Provider, connect } from "react-redux"
import { fetchDepartments } from "@options/departments"
import { useRouter } from "next/router"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import DefaultPic from "@public/images/avatar/officer.png"
import ImageUpload from "@components/imageUpload"
import Link from "next/link"
import PropTypes from "prop-types"
import React, { useEffect, useState, Fragment } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const Officer: React.FunctionComponent = ({
	createOfficer,
	officer,
	getOfficer,
	inverted,
	searchInteractions,
	updateImg
}) => {
	const router = useRouter()
	const { departmentId, slug } = router.query

	const { departmentName, departmentSlug, id, img } = officer.data

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

				let departmentOptions = []
				if (typeof departmentId !== "undefined") {
					departmentOptions = await fetchDepartments({ id: departmentId })
					setDepartmentOptions(departmentOptions)
					setDepartment(parseInt(departmentId, 10))
				} else {
					departmentOptions = await fetchDepartments({ q: "" })
					setDepartmentOptions(departmentOptions)
				}
			}

			if (typeof slug !== "undefined" && slug !== "create") {
				setCreateMode(false)
				await getOfficer({
					callback: (officerId) => {
						searchInteractions({ officerId })
					},
					id: slug
				})
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
		const departmentOptions = await fetchDepartments({ q })
		setDepartmentOptions(departmentOptions)
	}

	const loadMore = (page, officerId) => {
		return searchInteractions({ officerId, page })
	}

	const selectDepartment = (e, { value }) => {
		setDepartment(value)
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem="officers"
				containerClassName="officersPage"
				seo={{
					description:
						"Keep tabs on police officers and their interactions with citizens in their jurisdiction",
					image: {
						height: 500,
						src: "/public/images/logos/logo.png",
						width: 500
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
									<Input
										onChange={(e, { value }) => setFirstName(value)}
										placeholder="First name"
										value={firstName}
									/>
								</Form.Field>
								<Form.Field>
									<Input
										onChange={(e, { value }) => setLastName(value)}
										placeholder="Last name"
										value={lastName}
									/>
								</Form.Field>
							</Form.Group>
							<Form.Field>
								<Dropdown
									onChange={selectDepartment}
									onSearchChange={changeDepartment}
									options={departmentOptions}
									placeholder="Department"
									search
									selection
									value={department}
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
										color="yellow"
										content="Search all officers"
										inverted={inverted}
										onClick={() => router.push(`/officers`)}
									/>
								</Header>
							</Container>
						) : (
							<Fragment>
								{officer.loading ? (
									<Container textAlign="center">
										<Dimmer active className="pageDimmer">
											<Loader active size="huge">
												Loading
											</Loader>
										</Dimmer>
									</Container>
								) : (
									<Fragment>
										<Grid>
											<Grid.Row>
												<Grid.Column width={4}>
													<ImageUpload
														bearer={bearer}
														callback={(bearer, file, id) =>
															updateImg({ bearer, file, id })
														}
														fluid
														id={officer.data.id}
														img={img === null ? DefaultPic : img}
														inverted={inverted}
													/>
												</Grid.Column>
												<Grid.Column width={12}>
													{!officer.loading && (
														<Fragment>
															<Header as="h1" inverted={inverted}>
																{officer.data.firstName}{" "}
																{officer.data.lastName}
																<Header.Subheader>
																	<Link
																		href={`/departments/${departmentSlug}`}
																	>
																		<a>{departmentName}</a>
																	</Link>
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
																			`/interactions/create?deparmentId=${id}`
																		)
																	}
																/>
															</div>
															<List
																className="gridList"
																horizontal
																inverted={inverted}
																size="big"
															>
																<List.Item active>
																	<b>
																		{
																			officer.data
																				.interactionCount
																		}
																	</b>{" "}
																	{formatPlural(
																		officer.data
																			.interactionCount,
																		"interaction"
																	)}
																</List.Item>
															</List>
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
												loadMore={({ page, officerId }) =>
													loadMore(page, officerId)
												}
												officerId={officer.data.id}
												page={officer.interactions.page}
												results={officer.interactions.results}
												type="interactions"
											/>
										) : null}
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

Officer.propTypes = {
	createOfficer: PropTypes.func,
	getOfficer: PropTypes.func,
	inverted: PropTypes.bool,
	officer: PropTypes.shape({
		data: PropTypes.shape({
			createdAt: PropTypes.string,
			departmentName: PropTypes.string,
			departmentSlug: PropTypes.string,
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
	searchInteractions: PropTypes.func,
	updateImg: PropTypes.func
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
	searchInteractions,
	updateImg
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.officer,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		createOfficer,
		getOfficer,
		searchInteractions,
		updateImg
	}),
	withTheme("dark")
)(Officer)
