import { Container, Header, Item, Label, Placeholder, Segment, Visibility } from "semantic-ui-react"
import { s3BaseUrl } from "@options/config"
import DefaultPic from "@public/images/placeholders/placeholder-dark.jpg"
import LinkedText from "@components/linkedText"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Fragment, useState } from "react"
import Router from "next/router"

const SearchResults: React.FunctionComponent = ({
	hasMore,
	inverted,
	loading,
	loadMore,
	page,
	q,
	results,
	type
}) => {
	const [fetching, setFetching] = useState(false)

	const getCardImage = (s3Link) => {
		return s3Link === null ? DefaultPic : `${s3BaseUrl}${s3Link}`
	}

	const renderDepartmentsList = () => {
		return (
			<Item.Group className={`resultsList ${inverted ? "inverted" : ""}`}>
				{results.map((result) => {
					if (loading) {
						console.log("loading")
						return (
							<Item key={`resultsListItem${result.id}`}>
								<Item.Content>
									<Placeholder inverted={inverted}>
										<Placeholder.Header>
											<Placeholder.Line length="very long" />
											<Placeholder.Line length="long" />
										</Placeholder.Header>
										<Placeholder.Paragraph>
											<Placeholder.Line length="medium" />
										</Placeholder.Paragraph>
									</Placeholder>
								</Item.Content>
							</Item>
						)
					}

					let meta = result.state
					if (result.type === 2) {
						meta = `${result.city}, ${result.state}`
					}
					return (
						<Item
							key={`resultsListItem${result.id}`}
							onClick={() => Router.push(`/departments/${result.id}`)}
						>
							<Item.Content>
								<Item.Header>{result.name}</Item.Header>
								<Item.Meta>
									<span>{meta}</span>
								</Item.Meta>
								<Item.Description>
									<Label color="orange">52 interactions</Label>
									<Label color="blue">52 officers</Label>
								</Item.Description>
							</Item.Content>
						</Item>
					)
				})}
			</Item.Group>
		)
	}

	const renderOfficersList = () => {
		return (
			<Item.Group className={`resultsList ${inverted ? "inverted" : ""}`}>
				{results.map((result) => {
					return (
						<Item
							key={`resultsListItem${result.id}`}
							onClick={() => Router.push(`/officers/${result.slug}`)}
						>
							<Item.Image
								onError={(i) => (i.target.src = DefaultPic)}
								src={result.img === null ? DefaultPic : result.img}
							/>
							<Item.Content>
								<Item.Header>
									{result.firstName} {result.lastName}
								</Item.Header>
								<Item.Meta>{result.departmentName}</Item.Meta>
								<Item.Description>
									<Label color="orange">
										{result.interactionCount} interactions
									</Label>
								</Item.Description>
							</Item.Content>
						</Item>
					)
				})}
			</Item.Group>
		)
	}

	return (
		<div className={`searchResults ${type}`}>
			{results.length === 0 && !loading ? (
				<Container textAlign="center">
					<Segment inverted={inverted} placeholder>
						<Header icon size="huge">
							No {type} yet...
						</Header>
					</Segment>
				</Container>
			) : (
				<Visibility
					continuous
					onBottomVisible={async () => {
						if (hasMore && !fetching) {
							setFetching(true)
							await loadMore({ page, q })
							setFetching(false)
						}
					}}
				>
					{type === "departments" && renderDepartmentsList()}
					{type === "officers" && renderOfficersList()}
				</Visibility>
			)}
		</div>
	)
}

SearchResults.propTypes = {
	hasMore: PropTypes.bool,
	inverted: PropTypes.bool,
	loading: PropTypes.bool,
	loadMore: PropTypes.func,
	page: PropTypes.number,
	q: PropTypes.string,
	results: PropTypes.arrayOf(
		PropTypes.oneOfType([
			PropTypes.bool,
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
	type: PropTypes.oneOf(["departments", "interactions", "officers"])
}

export default SearchResults
