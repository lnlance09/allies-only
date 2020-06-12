import { Container, Header, Image, Placeholder, Segment, Visibility } from "semantic-ui-react"
import { s3BaseUrl } from "@options/config"
import DefaultPic from "@public/images/placeholders/placeholder-dark.jpg"
import LinkedText from "@components/linkedText"
import Masonry from "react-masonry-css"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Fragment, useState } from "react"
import Router from "next/router"

const MemeCard = ({ loading, inverted, description }) => {
	if (loading) {
		return (
			<Placeholder>
				<Placeholder.Header>
					<Placeholder.Line length="very long" />
					<Placeholder.Line length="long" />
				</Placeholder.Header>
				<Placeholder.Paragraph>
					<Placeholder.Line length="medium" />
				</Placeholder.Paragraph>
			</Placeholder>
		)
	}

	return (
		<div className={`gridElementText ${inverted ? "inverted" : ""}`}>
			<LinkedText text={description} />
		</div>
	)
}

MemeCard.propTypes = {
	description: PropTypes.string,
	inverted: PropTypes.bool,
	loading: PropTypes.bool
}

const SearchResults: React.FunctionComponent = ({
	hasMore,
	inverted,
	justImages,
	loading,
	loadMore,
	page,
	q,
	results,
	templateId,
	type,
	userId
}) => {
	const [fetching, setFetching] = useState(false)

	const getCardData = (type, result) => {
		if (type === "memes") {
			return {
				description: result.caption,
				link: `/meme/${result.id}`,
				subtitle: (
					<Fragment>
						<Moment date={result.createdAt} fromNow /> • {result.views} views
					</Fragment>
				),
				title: result.name === null ? `Meme #${result.id}` : result.name
			}
		}

		if (type === "templates") {
			return {
				link: `/template/${result.id}`
			}
		}

		return null
	}

	const getCardImage = (s3Link) => {
		return s3Link === null ? DefaultPic : `${s3BaseUrl}${s3Link}`
	}

	return (
		<div className={`searchResults ${type}`}>
			{results.length === 0 && !loading ? (
				<Container textAlign="center">
					<Segment inverted={inverted} placeholder>
						<Header icon size="huge">
							No results...
						</Header>
					</Segment>
				</Container>
			) : (
				<Visibility
					continuous
					onBottomVisible={async () => {
						if (hasMore && !fetching) {
							setFetching(true)
							await loadMore({ page, q, templateId, userId })
							setFetching(false)
						}
					}}
				>
					<Masonry
						breakpointCols={3}
						className="searchResultsMasonryGrid"
						columnClassName="searchResultsMasonryGridColumn"
					>
						{results.map((result, i) => {
							const { description, link } = getCardData(type, result)
							const img = getCardImage(result.s3Link)

							if (typeof result.id === "undefined") {
								return
							}

							return (
								<div
									className="gridElement"
									key={`${type}_${i}`}
									onClick={() => Router.push(link)}
								>
									{loading ? (
										<Placeholder inverted={inverted}>
											<Placeholder.Image square />
										</Placeholder>
									) : (
										<Image
											onError={(i) => (i.target.src = DefaultPic)}
											src={img}
										/>
									)}

									{!justImages && !loading ? (
										<MemeCard
											description={description}
											inverted={inverted}
											loading={loading}
										/>
									) : null}
								</div>
							)
						})}
					</Masonry>
				</Visibility>
			)}
		</div>
	)
}

SearchResults.propTypes = {
	hasMore: PropTypes.bool,
	inverted: PropTypes.bool,
	justImages: PropTypes.bool,
	loading: PropTypes.bool,
	loadMore: PropTypes.func,
	page: PropTypes.number,
	q: PropTypes.string,
	results: PropTypes.arrayOf(
		PropTypes.oneOfType([
			PropTypes.bool,
			PropTypes.shape({
				name: PropTypes.number,
				s3Link: PropTypes.string
			}),
			PropTypes.shape({
				caption: PropTypes.string,
				createdAt: PropTypes.string,
				createdBy: PropTypes.number,
				id: PropTypes.number,
				img: PropTypes.string,
				likes: PropTypes.number,
				name: PropTypes.string,
				s3Link: PropTypes.string,
				templateName: PropTypes.string,
				username: PropTypes.string,
				views: PropTypes.number
			}),
			PropTypes.shape({
				createdAt: PropTypes.string,
				img: PropTypes.string,
				name: PropTypes.string,
				username: PropTypes.string
			})
		])
	),
	templateId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	type: PropTypes.oneOf(["artists", "memes", "templates"]),
	userId: PropTypes.number
}

SearchResults.defaultProps = {}

export default SearchResults
