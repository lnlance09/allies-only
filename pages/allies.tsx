import { searchUsers } from "@actions/user"
import { Divider, Header } from "semantic-ui-react"
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

const Allies: React.FunctionComponent = ({ inverted, searchUsers, users }) => {
	const router = useRouter()
	const { q } = router.query

	const [searchVal, setSearchVal] = useState(q)

	useEffect(() => {
		searchUsers({ q })
		setSearchVal(q)
	}, [q])

	const loadMore = (page, q) => {
		return searchUsers({ page, q: searchVal })
	}

	const searchForResults = (e) => {
		const q = e.target.value
		setSearchVal(q)
		searchUsers({ page: 0, q })
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem="allies"
				containerClassName="alliesPage"
				seo={{
					description: "",
					image: {
						height: 200,
						src: "",
						width: 200
					},
					title: "Allies",
					url: `allies`
				}}
				showFooter={false}
			>
				<Header as="h1" inverted={inverted} size="huge">
					Allies
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
					hasMore={users.hasMore}
					inverted={inverted}
					loading={users.loading}
					loadMore={({ page, q }) => loadMore(page, q)}
					page={users.page}
					q={searchVal}
					results={users.results}
					type="users"
				/>
			</DefaultLayout>
		</Provider>
	)
}

Allies.propTypes = {
	inverted: PropTypes.bool,
	searchUsers: PropTypes.func,
	users: PropTypes.shape({
		hasMore: PropTypes.bool,
		loading: PropTypes.bool,
		page: PropTypes.number,
		results: PropTypes.arrayOf(
			PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.shape({
					createdAt: PropTypes.string,
					description: PropTypes.string,
					video: PropTypes.string
				})
			])
		)
	})
}

Allies.defaultProps = {
	searchUsers,
	users: {
		hasMore: false,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	}
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.user,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		searchUsers
	}),
	withTheme("dark")
)(Allies)
