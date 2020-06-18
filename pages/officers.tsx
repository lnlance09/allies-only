import { searchOfficers } from "@actions/officer"
import { Button, Divider, Header } from "semantic-ui-react"
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

const Officers: React.FunctionComponent = ({ inverted, officers, searchOfficers }) => {
	const router = useRouter()
	const { q } = router.query

	const [searchVal, setSearchVal] = useState(q)

	useEffect(() => {
		searchOfficers({ q })
		setSearchVal(q)
	}, [q])

	const loadMore = (page, q) => {
		return searchOfficers({ page, q: searchVal })
	}

	const searchForResults = (e) => {
		const q = e.target.value
		setSearchVal(q)
		searchOfficers({ page: 0, q })
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem="officers"
				containerClassName="officersPage"
				seo={{
					description: "",
					image: {
						height: 200,
						src: "",
						width: 200
					},
					title: "Police Officers",
					url: `officers`
				}}
				showFooter={false}
			>
				<Header as="h1" inverted={inverted} size="huge">
					Officers
					<Button
						className="addButton"
						color="yellow"
						content="Add an officer"
						icon="plus"
						inverted={inverted}
						onClick={() => {
							router.push("/officers/create")
						}}
					/>
				</Header>

				<div className={`ui icon input fluid big ${inverted ? "inverted" : ""}`}>
					<DebounceInput
						debounceTimeout={300}
						minLength={2}
						onChange={searchForResults}
						placeholder="Search..."
						value={searchVal}
					/>
					<i aria-hidden="true" className="search icon" />
				</div>

				<Divider inverted={inverted} section />

				<SearchResults
					hasMore={officers.hasMore}
					inverted={inverted}
					loading={officers.loading}
					loadMore={({ page, q }) => loadMore(page, q)}
					page={officers.page}
					q={searchVal}
					results={officers.results}
					type="officers"
				/>
			</DefaultLayout>
		</Provider>
	)
}

Officers.propTypes = {
	officers: PropTypes.shape({
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

Officers.defaultProps = {
	officers: {
		hasMore: false,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	},
	searchOfficers
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.officer,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		searchOfficers
	}),
	withTheme("dark")
)(Officers)
