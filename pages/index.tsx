import { searchInteractions } from "@actions/interaction"
import { Container, Header } from "semantic-ui-react"
import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import { s3BaseUrl } from "@options/config"
import { RootState } from "@store/reducer"
import { InitialPageState } from "@interfaces/options"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React, { useEffect } from "react"
import SearchResults from "@components/searchResults"
import store from "@store/index"

const Home: React.FC = ({ interactions, inverted, searchInteractions }) => {
	useEffect(() => {
		searchInteractions({ page: 0 })
	}, [])

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
						src: `${s3BaseUrl}logos/logo.png`,
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
							loadMore={({ callback, page }) =>
								searchInteractions({ callback, page })
							}
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

const mapStateToProps = (state: RootState, ownProps: InitialPageState) => ({
	...state.interaction,
	...ownProps
})

export default compose(connect(mapStateToProps, { searchInteractions }), withTheme("dark"))(Home)
