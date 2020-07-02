import { searchOfficers } from "@actions/officer"
import { Button, Container, Divider, Header } from "semantic-ui-react"
import { RootState } from "@store/reducer"
import { GetServerSideProps } from "next"
import { initial } from "@reducers/officer"
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
import store from "@store"

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const data = await axios.get(`${baseUrl}api/officer/search`, {
		params: {
			q: req.query.q
		}
	})

	const officers = initial.officers
	officers.hasMore = data.data.hasMore
	officers.loading = false
	officers.page = data.data.page
	officers.results = data.data.officers

	return {
		props: {
			officers
		}
	}
}

const Officers: React.FunctionComponent = ({ inverted, officers, searchOfficers }) => {
	const router = useRouter()
	const { q } = router.query

	const [searchVal, setSearchVal] = useState(q)

	useEffect(() => {
		searchOfficers({ q })
		setSearchVal(q)
	}, [q])

	const loadMore = (page, q) => {
		return searchOfficers({ page, q })
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
					description: "Browse officers and view their interactions with citizens",
					image: {
						height: 500,
						src: "/public/images/logos/logo.png",
						width: 500
					},
					title: "Police Officers",
					url: `officers`
				}}
				showFooter={false}
			>
				<Container>
					<Header as="h1" inverted={inverted} size="huge">
						Officers
						<Button
							className="addButton"
							color="yellow"
							content="Add"
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
							placeholder="Find an officer"
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
				</Container>
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
	inverted: PropTypes.bool,
	searchOfficers: PropTypes.func
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

const mapStateToProps = (state: RootState, ownProps: InitialPageState) => ({
	...state.officer,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		searchOfficers
	}),
	withTheme("dark")
)(Officers)
