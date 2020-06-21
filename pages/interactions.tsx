import { searchInteractions } from "@actions/interaction"
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

const Interactions: React.FunctionComponent = ({ interactions, inverted, searchInteractions }) => {
	const router = useRouter()
	const { q } = router.query

	const [searchVal, setSearchVal] = useState(q)

	useEffect(() => {
		searchInteractions({ page: 0, q })
		setSearchVal(q)
	}, [q])

	const loadMore = (page, q) => {
		return searchInteractions({ page, q })
	}

	const searchForResults = (e) => {
		const q = e.target.value
		setSearchVal(q)
		searchInteractions({ page: 0, q })
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem="interactions"
				containerClassName="interactionsPage"
				seo={{
					description: "View interactions between the police and citizens",
					image: {
						height: 500,
						src: "/public/images/logos/logo.png",
						width: 500
					},
					title: "Police Interactions",
					url: `interactions`
				}}
				showFooter={false}
			>
				<Header as="h1" inverted={inverted} size="huge">
					Interactions
					<Button
						className="addButton"
						color="yellow"
						content="Add an interaction"
						icon="plus"
						inverted={inverted}
						onClick={() => {
							router.push("/interactions/create")
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
					hasMore={interactions.hasMore}
					inverted={inverted}
					loading={interactions.loading}
					loadMore={({ page, q }) => loadMore(page, q)}
					page={interactions.page}
					q={searchVal}
					results={interactions.results}
					type="interactions"
				/>
			</DefaultLayout>
		</Provider>
	)
}

Interactions.propTypes = {
	interactions: PropTypes.shape({
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
	}),
	inverted: PropTypes.bool,
	searchInteractions: PropTypes.func
}

Interactions.defaultProps = {
	interactions: {
		hasMore: false,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	},
	searchInteractions
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.interaction,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		searchInteractions
	}),
	withTheme("dark")
)(Interactions)
