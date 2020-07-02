import { searchDepartments } from "@actions/department"
import { Button, Container, Divider, Form, Header } from "semantic-ui-react"
import { RootState } from "@store/reducer"
import { GetServerSideProps } from "next"
import { initial } from "@reducers/department"
import { InitialPageState } from "@interfaces/options"
import { DebounceInput } from "react-debounce-input"
import { Provider, connect } from "react-redux"
import { useRouter } from "next/router"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import { baseUrl } from "@options/config"
import axios from "axios"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import SearchResults from "@components/searchResults"
import store from "@store/index"

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const data = await axios.get(`${baseUrl}api/department/search`, {
		params: {
			q: req.query.q
		}
	})

	const initialDepartments = initial.initialDepartments
	initialDepartments.hasMore = data.data.hasMore
	initialDepartments.loading = false
	initialDepartments.page = data.data.page
	initialDepartments.results = data.data.departments

	return {
		props: {
			initialDepartments
		}
	}
}

const Departments: React.FC = ({
	departments,
	initialDepartments,
	inverted,
	searchDepartments
}) => {
	const router = useRouter()
	const { q } = router.query

	const [searchVal, setSearchVal] = useState(q)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		searchDepartments({ q })
		setSearchVal(q)
	}, [q])

	const loadMore = (page: number, q: string) => {
		return searchDepartments({ page, q })
	}

	const searchForResults = (e) => {
		setMounted(true)
		const q = e.target.value
		setSearchVal(q)
		searchDepartments({ page: 0, q })
	}

	let results = initialDepartments
	if (mounted) {
		results = departments
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem="departments"
				containerClassName="departmentsPage"
				seo={{
					description:
						"Browse police departments and view their officers' interactions with citizens",
					image: {
						height: 500,
						src: "/public/images/logos/logo.png",
						width: 500
					},
					title: "Police Departments",
					url: `departments`
				}}
				showFooter={false}
			>
				<Container>
					<Header as="h1" inverted={inverted} size="huge">
						Departments
						<Button
							className="addButton"
							color="yellow"
							content="Add"
							icon="plus"
							inverted={inverted}
							onClick={() => {
								router.push("/departments/create")
							}}
						/>
					</Header>

					<Form inverted={inverted}>
						<Form.Group>
							<Form.Field width={16}>
								<div
									className={`ui icon input fluid big ${
										inverted ? "inverted" : ""
									}`}
								>
									<DebounceInput
										debounceTimeout={300}
										minLength={2}
										onChange={searchForResults}
										placeholder="Find a department"
										value={searchVal}
									/>
									<i aria-hidden="true" className="search icon" />
								</div>
							</Form.Field>
						</Form.Group>
					</Form>

					<Divider inverted={inverted} section />

					<SearchResults
						hasMore={results.hasMore}
						inverted={inverted}
						loading={results.loading}
						loadMore={({ page, q }) => loadMore(page, q)}
						page={results.page}
						q={searchVal}
						results={results.results}
						type="departments"
					/>
				</Container>
			</DefaultLayout>
		</Provider>
	)
}

Departments.propTypes = {
	departments: PropTypes.shape({
		hasMore: PropTypes.bool,
		loading: PropTypes.bool,
		page: PropTypes.number,
		results: PropTypes.arrayOf(
			PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.shape({
					city: PropTypes.string,
					county: PropTypes.string,
					name: PropTypes.string,
					state: PropTypes.string,
					type: PropTypes.number
				})
			])
		)
	}),
	initialDepartments: PropTypes.shape({
		hasMore: PropTypes.bool,
		loading: PropTypes.bool,
		page: PropTypes.number,
		results: PropTypes.arrayOf(
			PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.shape({
					city: PropTypes.string,
					county: PropTypes.string,
					name: PropTypes.string,
					state: PropTypes.string,
					type: PropTypes.number
				})
			])
		)
	}),
	inverted: PropTypes.bool,
	searchDepartments: PropTypes.func
}

Departments.defaultProps = {
	departments: {
		hasMore: false,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	},
	initialDepartments: {
		hasMore: false,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	},
	searchDepartments
}

const mapStateToProps = (state: RootState, ownProps: InitialPageState) => ({
	...state.department,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		searchDepartments
	}),
	withTheme("dark")
)(Departments)
