import { searchMemes } from "@actions/search"
import { Container, Divider } from "semantic-ui-react"
import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React, { useEffect } from "react"
import SearchResults from "@components/searchResults"
import store from "@store"

const Home: React.FunctionComponent = (props) => {
	//static contextType = MyContext;
	console.log("props", props)
	const { inverted, memes, searchMemes } = props

	useEffect(() => {
		searchMemes({ page: 0 })
	}, [])

	const loadMore = (page) => {
		return searchMemes({ page })
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				containerClassName="homePage"
				seo={{
					description: "Browse the latest memes and create your own memes too",
					image: {
						height: 512,
						src: "/public/images/logos/default-logo.png",
						width: 512
					},
					title: "Home",
					url: ""
				}}
				showFooter={false}
			>
				<Divider hidden section />

				<Container>
					<SearchResults
						hasMore={memes.hasMore}
						inverted={inverted}
						justImages={false}
						loading={memes.loading}
						loadMore={({ page }) => loadMore(page)}
						page={memes.page}
						results={memes.results}
						type="memes"
					/>
				</Container>

				<Divider hidden section />
			</DefaultLayout>
		</Provider>
	)
}

Home.propTypes = {
	inverted: PropTypes.bool,
	memes: PropTypes.shape({
		hasMore: PropTypes.bool,
		loading: PropTypes.bool,
		page: PropTypes.number,
		results: PropTypes.arrayOf(
			PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.shape({
					caption: PropTypes.string,
					createdAt: PropTypes.string,
					createdBy: PropTypes.number,
					id: PropTypes.number,
					likes: PropTypes.number,
					name: PropTypes.string,
					s3Link: PropTypes.string,
					userImg: PropTypes.string,
					userName: PropTypes.string,
					username: PropTypes.string,
					views: PropTypes.number
				})
			])
		)
	}),
	searchMemes: PropTypes.func
}

Home.defaultProps = {
	memes: {
		loading: true,
		results: [false, false, false, false, false, false]
	},
	searchMemes
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.search,
	...ownProps
})

export default compose(connect(mapStateToProps, { searchMemes }), withTheme("dark"))(Home)
