import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import React, { useEffect } from "react"
import store from "@store"

const Home: React.FunctionComponent = ({ inverted }) => {
	useEffect(() => {
		// searchMemes({ page: 0 })
	}, [])

	const loadMore = (page) => {
		// return searchMemes({ page })
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
			></DefaultLayout>
		</Provider>
	)
}

Home.propTypes = {}

Home.defaultProps = {}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.home,
	...ownProps
})

export default compose(connect(mapStateToProps, {}), withTheme("dark"))(Home)
