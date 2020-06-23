import { searchInteractions } from "@actions/interaction"
import { Container, Divider, Header } from "semantic-ui-react"
import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React, { useEffect } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const Home: React.FunctionComponent = ({ interactions, inverted, searchInteractions }) => {
	useEffect(() => {
		searchInteractions({ page: 0 })
	}, [])

	const loadMore = (page) => {
		return searchInteractions({ page })
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				activeItem="interactions"
				containerClassName="homePage"
				seo={{
					description:
						"Become an ally in the fight against police brutality and corruption",
					image: {
						height: 500,
						src: "/public/images/logos/logo.png",
						width: 500
					},
					title: "Home",
					url: ""
				}}
				showFooter={false}
			>
				<Container>
					<Header as="h1" inverted={inverted}>
						Recently added
					</Header>

					<div style={{ marginTop: "28px" }}>
						<SearchResults
							hasMore={interactions.hasMore}
							inverted={inverted}
							loading={interactions.loading}
							loadMore={({ page, q }) => loadMore(page, q)}
							page={interactions.page}
							results={interactions.results}
							type="interactions"
						/>
					</div>
				</Container>
			</DefaultLayout>
		</Provider>
	)
}

Home.propTypes = {
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

Home.defaultProps = {
	interactions: {
		hasMore: false,
		loading: true,
		page: 0,
		results: []
	},
	searchInteractions
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.interaction,
	...ownProps
})

export default compose(connect(mapStateToProps, { searchInteractions }), withTheme("dark"))(Home)
