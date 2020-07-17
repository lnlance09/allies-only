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
	Image,
	Input,
	List,
	Loader
} from "semantic-ui-react"
import { RootState } from "@store/reducer"
import { GetServerSideProps } from "next"
import { initial } from "@reducers/officer"
import { InitialPageState } from "@interfaces/options"
import { formatPlural } from "@utils/textFunctions"
import { parseJwt } from "@utils/tokenFunctions"
import { Provider, connect } from "react-redux"
import { fetchDepartments } from "@options/departments"
import { useRouter } from "next/router"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import { baseUrl, s3BaseUrl } from "@options/config"
import axios from "axios"
import DefaultLayout from "@layouts/default"
import DefaultPic from "@public/images/avatar/officer.png"
import https from "https"
import ImageUpload from "@components/imageUpload"
import Link from "next/link"
import PropTypes from "prop-types"
import React, { useEffect, useState, Fragment } from "react"
import SearchResults from "@components/searchResults"
import store from "@store/index"

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const initialOfficer = initial.initialOfficer

	if (typeof params === "undefined") {
		return {
			props: {
				initialOfficer
			}
		}
	}

	if (params.slug === "create") {
		return {
			props: {
				initialOfficer
			}
		}
	}

	const data = await axios.get(`${baseUrl}api/officer/${params.slug}`, {
		httpsAgent: new https.Agent({
			rejectUnauthorized: false
		})
	})
	if (data.data.error) {
		initialOfficer.data = {}
		initialOfficer.error = true
		initialOfficer.errorMsg = data.data.msg
	} else {
		initialOfficer.data = data.data.officer
		initialOfficer.error = false
		initialOfficer.errorMsg = ""
	}

	initialOfficer.loading = false

	return {
		props: {
			initialOfficer
		}
	}
}

const Officer: React.FC = ({
	createOfficer,
	initialOfficer,
	officer,
	getOfficer,
	inverted,
	searchInteractions,
	updateImg
}) => {
	const router = useRouter()
	const { departmentId, slug } = router.query

	const [authenticated, setAuthenticated] = useState(false)
	const [bearer, setBearer] = useState(null)
	const [createMode, setCreateMode] = useState(slug === "create")
	const [department, setDepartment] = useState("")
	const [departmentOptions, setDepartmentOptions] = useState([])
	const [firstName, setFirstName] = useState("")
	const [formLoading, setFormLoading] = useState(false)
	const [lastName, setLastName] = useState("")

	useEffect(() => {
		const getInitialProps = async () => {
			const userData = parseJwt()
			if (userData) {
				setAuthenticated(true)
				setBearer(localStorage.getItem("jwtToken"))
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

	const selectDepartment = (e, { value }) => {
		setDepartment(value)
	}

	const seoTitle = createMode
		? "Add an officer"
		: initialOfficer.error
		? "Not found"
		: `${initialOfficer.data.firstName} ${initialOfficer.data.lastName}`
	const seoDescription = createMode
		? "Keep tabs on police officers and their interactions with citizens in their jurisdiction"
		: initialOfficer.error
		? "Not found"
		: `${initialOfficer.data.firstName} ${initialOfficer.data.lastName}'s interactions with citizens`

	let seoImage = {
		height: 500,
		src: `${s3BaseUrl}logos/logo.png`,
		width: 500
	}

	if (!createMode && !initialOfficer.error) {
		seoImage = {
			height: 500,
			src:
				initialOfficer.data.img === null
					? `${s3BaseUrl}logos/logo.png`
					: `${s3BaseUrl}${initialOfficer.data.img}`,
			width: 500
		}
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem="officers"
				containerClassName="officersPage"
				seo={{
					description: seoDescription,
					image: seoImage,
					title: seoTitle,
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
							disabled={firstName === "" || lastName === "" || department === ""}
							fluid
							loading={formLoading}
							onClick={addOfficer}
							size="big"
						/>
					</Container>
				)}

				{createMode === false && (
					<Fragment>
						{initialOfficer.error ? (
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
							<Container>
								{officer.loading ? (
									<Container textAlign="center">
										<Dimmer active className="pageDimmer">
											<Loader active size="huge" />
										</Dimmer>
									</Container>
								) : (
									<Fragment>
										<Grid>
											<Grid.Row>
												<Grid.Column width={5}>
													{authenticated ? (
														<ImageUpload
															bearer={bearer}
															callback={(bearer, file, id) =>
																updateImg({ bearer, file, id })
															}
															fluid
															id={officer.data.id}
															img={
																officer.data.img === null
																	? DefaultPic
																	: officer.data.img
															}
															inverted={inverted}
														/>
													) : (
														<Image
															onError={(i) =>
																(i.target.src = DefaultPic)
															}
															rounded
															src={
																officer.data.img === null
																	? DefaultPic
																	: officer.data.img
															}
														/>
													)}
												</Grid.Column>
												<Grid.Column width={11}>
													{!initialOfficer.loading && (
														<Fragment>
															<Header as="h1" inverted={inverted}>
																{initialOfficer.data.firstName}{" "}
																{initialOfficer.data.lastName}
																<Header.Subheader>
																	<Link
																		href={`/departments/${initialOfficer.data.departmentSlug}`}
																	>
																		<a className="officerDepartmentLink">
																			{
																				initialOfficer.data
																					.departmentName
																			}
																		</a>
																	</Link>
																</Header.Subheader>
															</Header>

															<div>
																<Button
																	color="yellow"
																	compact
																	content="Interaction"
																	icon="plus"
																	inverted={inverted}
																	onClick={() =>
																		router.push(
																			`/interactions/create?departmentId=${initialOfficer.data.departmentId}&officerId=${initialOfficer.data.id}`
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
																<List.Item>
																	<b>
																		{
																			initialOfficer.data
																				.interactionCount
																		}
																	</b>{" "}
																	{formatPlural(
																		initialOfficer.data
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
													searchInteractions({ officerId, page })
												}
												officerId={officer.data.id}
												page={officer.interactions.page}
												results={officer.interactions.results}
												type="interactions"
											/>
										) : null}
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

Officer.propTypes = {
	createOfficer: PropTypes.func,
	getOfficer: PropTypes.func,
	initialOfficer: PropTypes.shape({
		data: PropTypes.shape({
			createdAt: PropTypes.string,
			departmentId: PropTypes.number,
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
		loading: PropTypes.bool
	}),
	inverted: PropTypes.bool,
	officer: PropTypes.shape({
		data: PropTypes.shape({
			createdAt: PropTypes.string,
			departmentId: PropTypes.number,
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
			page: PropTypes.number,
			results: PropTypes.arrayOf(
				PropTypes.shape({
					createdAt: PropTypes.string,
					description: PropTypes.string,
					officer: PropTypes.shape({
						name: PropTypes.string
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
	initialOfficer: {
		data: {},
		error: false,
		errorMsg: "",
		loading: true
	},
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

const mapStateToProps = (state: RootState, ownProps: InitialPageState) => ({
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
