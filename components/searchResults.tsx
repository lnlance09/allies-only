import { Card, Container, Header, Item, Label, Segment, Visibility } from "semantic-ui-react"
import { formatPlural } from "@utils/textFunctions"
import { s3BaseUrl } from "@options/config"
import AllyPic from "@public/images/avatar/large/joe.jpg"
import DefaultPic from "@public/images/placeholders/placeholder-dark.jpg"
import Link from "next/link"
import Moment from "react-moment"
import OfficerPic from "@public/images/avatar/officer.png"
import PropTypes from "prop-types"
import React, { Fragment, useState } from "react"
import ReactPlayer from "react-player"
import Router from "next/router"

const SearchResults: React.FunctionComponent = ({
	departmentId,
	hasMore,
	inverted,
	loading,
	loadMore,
	officerId,
	page,
	q,
	results,
	type,
	userId
}) => {
	const [fetching, setFetching] = useState(false)

	const renderDepartmentsList = () => {
		return (
			<Item.Group className={`resultsList ${inverted ? "inverted" : ""}`}>
				{results.map((result) => {
					const {
						city,
						id,
						interactionCount,
						name,
						officerCount,
						slug,
						state,
						type
					} = result

					let meta = state
					if (type === 2) {
						meta = `${city}, ${state}`
					}

					return (
						<Item
							key={`resultsListItem${id}`}
							onClick={() => Router.push(`/departments/${slug}`)}
						>
							<Item.Content>
								<Item.Header>{name}</Item.Header>
								<Item.Meta>
									<span>{meta}</span>
								</Item.Meta>
								<Item.Description>
									<Label color="yellow">
										{interactionCount}{" "}
										{formatPlural(interactionCount, "interaction")}
									</Label>
									<Label color="orange">
										{officerCount} {formatPlural(officerCount, "officer")}
									</Label>
								</Item.Description>
							</Item.Content>
						</Item>
					)
				})}
			</Item.Group>
		)
	}

	const renderInteractionsList = () => {
		return (
			<Card.Group
				className={`resultsList ${inverted ? "inverted" : ""}`}
				itemsPerRow={2}
				stackable
			>
				{results.map((result, i) => {
					return (
						<Card
							fluid
							key={`interaction${i}`}
							onClick={() => Router.push(`/interactions/${result.id}`)}
						>
							<ReactPlayer
								height="100%"
								muted
								playing={false}
								style={{ lineHeight: 0.8 }}
								url={result.video}
								width="100%"
							/>
							<Card.Content>
								<Card.Header>{result.title}</Card.Header>
								<Card.Meta>
									<Moment date={result.createdAt} fromNow /> •{" "}
									<Link href={`/departments/${result.departmentId}`}>
										<a>{result.departmentName}</a>
									</Link>
								</Card.Meta>
								<Card.Description className="interactionDescription">
									{result.description}
								</Card.Description>
							</Card.Content>
						</Card>
					)
				})}
			</Card.Group>
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
								src={result.img === null ? OfficerPic : `${s3BaseUrl}${result.img}`}
							/>
							<Item.Content>
								<Item.Header>
									{result.firstName} {result.lastName}
								</Item.Header>
								<Item.Meta>{result.departmentName}</Item.Meta>
								<Item.Description>
									<Label color="orange">
										{result.interactionCount}{" "}
										{formatPlural(result.interactionCount, "interaction")}
									</Label>
								</Item.Description>
							</Item.Content>
						</Item>
					)
				})}
			</Item.Group>
		)
	}

	const renderUsersList = () => {
		return (
			<Item.Group className={`resultsList ${inverted ? "inverted" : ""}`}>
				{results.map((result) => {
					return (
						<Item
							key={`resultsListItem${result.id}`}
							onClick={() => Router.push(`/${result.username}`)}
						>
							<Item.Image
								onError={(i) => (i.target.src = AllyPic)}
								src={result.img === null ? AllyPic : `${s3BaseUrl}${result.img}`}
							/>
							<Item.Content>
								<Item.Header>{result.name}</Item.Header>
								<Item.Meta>@{result.username}</Item.Meta>
								<Item.Description>
									<Label color="orange">
										{result.interactionCount}{" "}
										{formatPlural(result.interactionCount, "interaction")}
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
						<Header icon size="large">
							No {type}
						</Header>
					</Segment>
				</Container>
			) : (
				<Visibility
					continuous
					onBottomVisible={async () => {
						if (hasMore && !fetching) {
							setFetching(true)
							await loadMore({ departmentId, officerId, page, q, userId })
							setFetching(false)
						}
					}}
				>
					{type === "allies" && renderUsersList()}
					{type === "departments" && renderDepartmentsList()}
					{type === "interactions" && renderInteractionsList()}
					{type === "officers" && renderOfficersList()}
				</Visibility>
			)}
		</div>
	)
}

SearchResults.propTypes = {
	departmentId: PropTypes.number,
	hasMore: PropTypes.bool,
	inverted: PropTypes.bool,
	loading: PropTypes.bool,
	loadMore: PropTypes.func,
	officerId: PropTypes.number,
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
	type: PropTypes.oneOf(["allies", "departments", "interactions", "officers"]),
	userId: PropTypes.number
}

export default SearchResults
