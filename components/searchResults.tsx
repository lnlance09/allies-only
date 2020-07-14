import {
	Card,
	Container,
	Header,
	Icon,
	Image,
	Item,
	Label,
	Segment,
	Visibility
} from "semantic-ui-react"
import { formatPlural } from "@utils/textFunctions"
import { s3BaseUrl } from "@options/config"
import AllyPic from "@public/images/avatar/large/joe.jpg"
import DefaultPic from "@public/images/placeholders/placeholder-dark.jpg"
import Moment from "react-moment"
import OfficerPic from "@public/images/avatar/officer.png"
import PropTypes from "prop-types"
import React, { useState } from "react"
import Router from "next/router"

const SearchResults: React.FC = ({
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
									{interactionCount > 0 && (
										<Label color="yellow">
											{interactionCount}{" "}
											{formatPlural(interactionCount, "interaction")}
										</Label>
									)}
									{officerCount > 0 && (
										<Label color="orange">
											{officerCount} {formatPlural(officerCount, "officer")}
										</Label>
									)}
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
				className={`resultsList interactions ${inverted ? "inverted" : ""}`}
				itemsPerRow={2}
				stackable
			>
				{results.map((result, i) => {
					const totalCommentCount = parseInt(
						result.commentCount + result.responseCount,
						10
					)
					return (
						<Card
							fluid
							key={`interaction${i}`}
							onClick={() => Router.push(`/interactions/${result.id}`)}
						>
							<Image
								onError={(i) => (i.target.src = DefaultPic)}
								src={result.img === null ? DefaultPic : result.img}
								wrapped={false}
							/>
							<Card.Content>
								<Card.Header>{result.title}</Card.Header>
								<Card.Meta>
									<Moment date={result.createdAt} fromNow />•{" "}
									<span>{result.userName}</span>
								</Card.Meta>
								<Card.Description className="interactionDescription">
									{result.description}
								</Card.Description>
							</Card.Content>
							<Card.Content extra>
								<Icon inverted={inverted} name="comment" />
								<span className="commentCount">
									{totalCommentCount} {formatPlural(totalCommentCount, "comment")}
								</span>
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
								onError={(i) => (i.target.src = OfficerPic)}
								src={result.img === null ? OfficerPic : `${s3BaseUrl}${result.img}`}
							/>
							<Item.Content>
								<Item.Header>
									{result.firstName} {result.lastName}
								</Item.Header>
								<Item.Meta>{result.departmentName}</Item.Meta>
								<Item.Description>
									{result.interactionCount > 0 && (
										<Label color="orange">
											{result.interactionCount}{" "}
											{formatPlural(result.interactionCount, "interaction")}
										</Label>
									)}
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
								<Item.Header>
									{result.name}{" "}
									<span className="username">@{result.username}</span>
								</Item.Header>
								<Item.Meta>
									<span style={{ display: "block", marginTop: "10px" }}>
										<Label color="orange">
											{result.interactionCount}{" "}
											{formatPlural(result.interactionCount, "interaction")}
										</Label>
									</span>
								</Item.Meta>
								<Item.Description>{result.bio}</Item.Description>
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
							await loadMore({
								callback: () => setFetching(false),
								departmentId,
								officerId,
								page,
								q,
								userId
							})
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
				bio: PropTypes.string,
				commentCount: PropTypes.number,
				createdAt: PropTypes.string,
				id: PropTypes.number,
				img: PropTypes.string,
				interactionCount: PropTypes.number,
				name: PropTypes.string,
				status: PropTypes.number,
				username: PropTypes.string
			}),
			PropTypes.shape({
				city: PropTypes.string,
				county: PropTypes.string,
				id: PropTypes.number,
				interactionCount: PropTypes.number,
				lat: PropTypes.string,
				lon: PropTypes.string,
				name: PropTypes.string,
				officerCount: PropTypes.number,
				state: PropTypes.string,
				type: PropTypes.number
			}),
			PropTypes.shape({
				createdAt: PropTypes.string,
				commentCount: PropTypes.number,
				description: PropTypes.string,
				img: PropTypes.string,
				userName: PropTypes.string,
				video: PropTypes.string
			}),
			PropTypes.shape({
				createdAt: PropTypes.string,
				departmentId: PropTypes.number,
				departmentName: PropTypes.string,
				departmentSlug: PropTypes.string,
				firstName: PropTypes.string,
				id: PropTypes.number,
				img: PropTypes.string,
				interactionCount: PropTypes.number,
				lastName: PropTypes.string,
				position: PropTypes.string
			})
		])
	),
	type: PropTypes.oneOf(["allies", "departments", "interactions", "officers"]),
	userId: PropTypes.number
}

export default SearchResults
