import { createDepartment, getDepartment } from "@actions/department"
import { searchInteractions } from "@actions/interaction"
import { searchOfficers } from "@actions/officer"
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
import { Provider, connect } from "react-redux"
import { fetchCities } from "@options/cities"
import { useRouter } from "next/router"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import MapBox from "@components/mapBox"
import PropTypes from "prop-types"
import React, { useEffect, useState, Fragment } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const Department: React.FunctionComponent = ({
	createDepartment,
	department,
	getDepartment,
	inverted,
	searchInteractions,
	searchOfficers
}) => {
	const router = useRouter()
	const { slug } = router.query

	const [activeItem, setActiveItem] = useState("officers")
	const [city, setCity] = useState("")
	const [createMode, setCreateMode] = useState(false)
	const [formLoading, setFormLoading] = useState(false)
	const [locationOptions, setLocationOptions] = useState([])
	const [name, setName] = useState("")

	useEffect(() => {
		const getInitialProps = async () => {
			if (slug === "create") {
				setCreateMode(true)
				const locationOptions = await fetchCities("")
				setLocationOptions(locationOptions)
			}

			if (typeof slug !== "undefined" && slug !== "create") {
				setCreateMode(false)
				await getDepartment({
					callback: (departmentId) => {
						searchOfficers({ departmentId })
						searchInteractions({ departmentId })
					},
					id: slug
				})
			}
		}

		getInitialProps()
	}, [slug])

	const addDepartment = () => {
		setFormLoading(true)
		createDepartment({ callback: () => setFormLoading(false), city, name })
	}

	const changeCity = async (e) => {
		const q = e.target.value
		const locationOptions = await fetchCities(q)
		setLocationOptions(locationOptions)
	}

	const loadMore = (page, departmentId) => {
		if (activeItem === "officers") {
			return searchOfficers({ departmentId, page })
		}

		return searchInteractions({ departmentId, page })
	}

	const selectCity = (e, { value }) => {
		setCity(value)
	}

	let results = department.officers
	if (activeItem === "interactions") {
		results = department.interactions
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				containerClassName="departmentsPage"
				seo={{
					description: createMode
						? "Add a new police department"
						: `Keep tabs on the ${department.data.name} and their interactions with citizens in their jurisdiction`,
					image: {
						height: 500,
						src: "/public/images/logos/logo.png",
						width: 500
					},
					title: createMode ? "Add a department" : department.data.name,
					url: `departments/${slug}`
				}}
				showFooter={false}
			>
				{createMode && (
					<Container>
						<Header as="h1" inverted={inverted} size="huge">
							Add a new department
						</Header>

						<Form
							error={department.error}
							inverted={inverted}
							size="big"
							style={{ marginTop: "24px" }}
						>
							<Form.Field>
								<Input
									onChange={(e, { value }) => setName(value)}
									placeholder="Name"
									value={name}
								/>
							</Form.Field>
							<Form.Field>
								<Dropdown
									onChange={selectCity}
									onSearchChange={changeCity}
									options={locationOptions}
									placeholder="City"
									search
									selection
									value={city}
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
							onClick={addDepartment}
							size="big"
						/>
					</Container>
				)}

				{!createMode && (
					<Fragment>
						{department.error ? (
							<Container className="errorMsgContainer" textAlign="center">
								<Header as="h1" inverted={inverted}>
									This department does not exist
									<div />
									<Button
										color="yellow"
										content="Search all departments"
										inverted={inverted}
										onClick={() => router.push(`/departments`)}
									/>
								</Header>
							</Container>
						) : (
							<Fragment>
								{department.loading ? (
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
													<MapBox
														lat={parseFloat(department.data.lat, 10)}
														lng={parseFloat(department.data.lon, 10)}
														zoom={department.data.type === 1 ? 4 : 9}
													/>
												</Grid.Column>
												<Grid.Column width={12}>
													<Header as="h1" inverted={inverted}>
														{department.data.name}
														<Header.Subheader>
															{department.data.type === 1 && (
																<Fragment>
																	{department.data.state}
																</Fragment>
															)}
															{department.data.type === 2 && (
																<Fragment>
																	{department.data.city},{" "}
																	{department.data.state}
																</Fragment>
															)}
															{department.data.type === 3 && (
																<Fragment>
																	{department.data.county} County,{" "}
																	{department.data.state}
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
																	`/interactions/create?departmentId=${department.data.id}`
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
																	`/officers/create?departmentId=${department.data.id}`
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
															<b>{department.data.officerCount}</b>{" "}
															{formatPlural(
																department.data.officerCount,
																"officer"
															)}
														</List.Item>
														<List.Item
															active={activeItem === "interactions"}
															onClick={() =>
																setActiveItem("interactions")
															}
														>
															<b>
																{department.data.interactionCount}
															</b>{" "}
															{formatPlural(
																department.data.interactionCount,
																"interaction"
															)}
														</List.Item>
													</List>
												</Grid.Column>
											</Grid.Row>
										</Grid>
										<Divider section />

										{!department.error && !department.loading ? (
											<SearchResults
												departmentId={department.data.id}
												hasMore={results.hasMore}
												inverted={inverted}
												loading={results.loading}
												loadMore={({ page, departmentId }) =>
													loadMore(page, departmentId)
												}
												page={results.page}
												results={results.results}
												type={activeItem}
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

Department.propTypes = {
	createDepartment: PropTypes.func,
	department: PropTypes.shape({
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
		loading: PropTypes.bool,
		officers: PropTypes.shape({
			error: PropTypes.bool,
			errorMsg: PropTypes.string,
			hasMore: PropTypes.bool,
			loading: PropTypes.bool,
			results: PropTypes.arrayOf(
				PropTypes.shape({
					img: PropTypes.string,
					name: PropTypes.string,
					position: PropTypes.string
				})
			)
		})
	}),
	getDepartment: PropTypes.func,
	inverted: PropTypes.bool,
	searchInteractions: PropTypes.func,
	searchOfficers: PropTypes.func
}

Department.defaultProps = {
	createDepartment,
	department: {
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
		loading: true,
		officers: {
			error: false,
			errorMsg: "",
			hasMore: false,
			loading: true,
			results: []
		}
	},
	getDepartment,
	searchInteractions,
	searchOfficers
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.department,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		createDepartment,
		getDepartment,
		searchInteractions,
		searchOfficers
	}),
	withTheme("dark")
)(Department)
