import { searchArtists, searchMemes, searchTemplates } from "@actions/search"
import { Button, Divider } from "semantic-ui-react"
import { useRouter } from "next/router"
import { DebounceInput } from "react-debounce-input"
import { Provider, connect } from "react-redux"
import { withTheme } from "@redux/ThemeProvider"
import { compose } from "redux"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import SearchResults from "@components/searchResults"
import UsersList from "@components/usersList"
import store from "@store"

const Explore: React.FunctionComponent = (props) => {
	const router = useRouter()
	const { q, type } = router.query

	const {
		artists,
		inverted,
		memes,
		searchArtists,
		searchMemes,
		searchTemplates,
		templates
	} = props

	const types = ["artists", "memes", "templates"]
	const defaultType = types.includes(type) ? type : "memes"

	const [activeItem, setActiveItem] = useState(defaultType)
	const [searchVal, setSearchVal] = useState(q)

	useEffect(() => {
		if (typeof type !== "undefined") {
			setActiveItem(type)

			if (type === "artists") {
				searchArtists({ q })
			}

			if (type === "memes") {
				searchMemes({ q })
			}

			if (type === "templates") {
				searchTemplates({ q })
			}
		}

		setSearchVal(q)
	}, [q, type])

	const loadMore = (page, q) => {
		if (activeItem === "artists") {
			return searchArtists({ page, q })
		}

		if (activeItem === "memes") {
			return searchMemes({ page, q })
		}

		if (activeItem === "templates") {
			return searchTemplates({ page, q })
		}
	}

	const onClickItem = (name) => {
		setActiveItem(name)

		if (name === "artists") {
			searchArtists({ q: searchVal })
		}

		if (name === "memes") {
			searchMemes({ q: searchVal })
		}

		if (name === "templates") {
			searchTemplates({ q: searchVal })
		}
	}

	const searchForResults = (e) => {
		const q = e.target.value
		setSearchVal(q)

		if (activeItem === "artists") {
			searchArtists({ q })
		}

		if (activeItem === "memes") {
			searchMemes({ q })
		}

		if (activeItem === "templates") {
			searchTemplates({ q })
		}
	}

	let results = memes
	if (activeItem === "artists") {
		results = artists
	}
	if (activeItem === "templates") {
		results = templates
	}

	return (
		<Provider store={store}>
			<DefaultLayout
				containerClassName="explorePage"
				seo={{
					description: "Find memes, templates, and artists on Brandy",
					image: {
						height: 512,
						src: "/public/images/logos/default-logo.png",
						width: 512
					},
					title: `Search for ${activeItem}`,
					url: `explore/${activeItem}`
				}}
				showFooter={false}
			>
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

				<Divider hidden inverted={inverted} />

				<Button.Group className="exploreFilterBtnGroup" widths={3}>
					<Button
						className={activeItem === "memes" ? "active" : ""}
						color="blue"
						content="Memes"
						fluid
						inverted={inverted}
						onClick={() => onClickItem("memes")}
						size="big"
					/>
					<Button
						className={activeItem === "templates" ? "active" : ""}
						color="blue"
						content="Templates"
						fluid
						inverted={inverted}
						onClick={() => onClickItem("templates")}
						size="big"
					/>
					<Button
						className={activeItem === "artists" ? "active" : ""}
						color="blue"
						content="Artists"
						fluid
						inverted={inverted}
						onClick={() => onClickItem("artists")}
						size="big"
					/>
				</Button.Group>

				<Divider section />

				{activeItem === "artists" ? (
					<UsersList
						hasMore={results.hasMore}
						inverted={inverted}
						loading={results.loading}
						loadMore={(page, q) => loadMore(page, q)}
						page={results.page}
						q={searchVal}
						results={results.results}
					/>
				) : (
					<SearchResults
						hasMore={results.hasMore}
						inverted={inverted}
						justImages={activeItem === "templates"}
						loading={results.loading}
						loadMore={({ page, q }) => loadMore(page, q)}
						page={results.page}
						q={searchVal}
						results={results.results}
						type={activeItem}
					/>
				)}
			</DefaultLayout>
		</Provider>
	)
}

Explore.propTypes = {
	artists: PropTypes.shape({
		hasMore: PropTypes.bool,
		loading: PropTypes.bool,
		page: PropTypes.number,
		results: PropTypes.arrayOf(
			PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.shape({
					createdAt: PropTypes.string,
					img: PropTypes.string,
					memeCount: PropTypes.number,
					name: PropTypes.string,
					templateCount: PropTypes.number,
					username: PropTypes.string
				})
			])
		)
	}),
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
	searchArtists: PropTypes.func,
	searchMemes: PropTypes.func,
	searchTemplates: PropTypes.func,
	templates: PropTypes.shape({
		hasMore: PropTypes.bool,
		loading: PropTypes.bool,
		page: PropTypes.number,
		results: PropTypes.arrayOf(
			PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.shape({
					name: PropTypes.number,
					s3Link: PropTypes.string
				})
			])
		)
	})
}

Explore.defaultProps = {
	artists: {
		hasMore: true,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	},
	memes: {
		hasMore: true,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	},
	searchArtists,
	searchMemes,
	searchTemplates,
	templates: {
		hasMore: true,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	}
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.search,
	...ownProps
})

export default compose(
	connect(mapStateToProps, {
		searchArtists,
		searchMemes,
		searchTemplates
	}),
	withTheme("dark")
)(Explore)
