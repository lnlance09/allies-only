import { searchDepartments } from "@actions/department"
import { Button, Divider, Dropdown, Form, Header, Input, Select } from "semantic-ui-react"
import { DebounceInput } from "react-debounce-input"
import { Provider, connect } from "react-redux"
import { useRouter } from "next/router"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const Departments: React.FunctionComponent = ({ departments, inverted, searchDepartments }) => {
	const router = useRouter()
	const { q } = router.query

	const [searchVal, setSearchVal] = useState(q)

	useEffect(() => {
		searchDepartments({ q })
		setSearchVal(q)
	}, [q])

	const loadMore = (page, q) => {
		return searchDepartments({ page, q: searchVal })
	}

	const searchForResults = (e) => {
		const q = e.target.value
		setSearchVal(q)
		searchDepartments({ page: 0, q })
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem="departments"
				containerClassName="departmentsPage"
				seo={{
					description: "",
					image: {
						height: 200,
						src: "",
						width: 200
					},
					title: "Police Departments",
					url: `departments`
				}}
				showFooter={false}
			>
				<Header as="h1" inverted={inverted} size="huge">
					Departments
					<Button
						className="addButton"
						color="yellow"
						content="Add a department"
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
								className={`ui icon input fluid big ${inverted ? "inverted" : ""}`}
							>
								<DebounceInput
									debounceTimeout={300}
									minLength={2}
									onChange={searchForResults}
									placeholder="Search..."
									value={searchVal}
								/>
								<i aria-hidden="true" className="search icon" />
							</div>
						</Form.Field>
					</Form.Group>
				</Form>

				<Divider inverted={inverted} section />

				<SearchResults
					hasMore={departments.hasMore}
					inverted={inverted}
					loading={departments.loading}
					loadMore={({ page, q }) => loadMore(page, q)}
					page={departments.page}
					q={searchVal}
					results={departments.results}
					type="departments"
				/>
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
	inverted: PropTypes.bool
}

Departments.defaultProps = {
	departments: {
		hasMore: false,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	},
	searchDepartments
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.department,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		searchDepartments
	}),
	withTheme("dark")
)(Departments)
