import { Container, Divider, Header, Image, Segment, Visibility } from "semantic-ui-react"
import { useRouter } from "next/router"
import Comments from "@components/comments"
import DefaultPic from "@public/images/placeholders/placeholder-dark.jpg"
import Link from "next/link"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { useState } from "react"

const InteractionComments: React.FC = ({
	comments,
	hasMore,
	inverted,
	loading,
	loadMore,
	page,
	userId
}) => {
	const router = useRouter()
	const [fetching, setFetching] = useState(false)

	return (
		<div className="interactionComments">
			{comments.results.length === 0 && !loading ? (
				<Container textAlign="center">
					<Segment inverted={inverted} placeholder>
						<Header icon size="large">
							No comments
						</Header>
					</Segment>
				</Container>
			) : (
				<Visibility
					continuous
					onBottomVisible={async () => {
						if (hasMore && !fetching) {
							setFetching(true)
							await loadMore({ page, userId })
							setFetching(false)
						}
					}}
				>
					{comments.results.map((result) => {
						return (
							<Segment
								className="interactionCommentSegment"
								key={`interactionCommentResult${result.id}`}
								inverted={inverted}
							>
								<Header inverted={inverted} size="large">
									<Image
										onClick={() => router.push(`/interactions/${result.id}`)}
										onError={(i) => (i.target.src = DefaultPic)}
										rounded
										src={result.img ? result.img : DefaultPic}
									/>{" "}
									<Header.Content>
										<Link href={`/interactions/${result.id}`}>
											<a>{result.title}</a>
										</Link>
										<Header.Subheader>
											<Moment date={result.createdAt} fromNow />
										</Header.Subheader>
									</Header.Content>
								</Header>
								<Divider inverted={inverted} />
								<Comments
									allowNewPosts={false}
									allowReplies={false}
									comments={{
										results: result.comments
									}}
									interactionId={result.id}
									inverted={inverted}
									// loadMoreComments={({ interactionId, page }) =>
									//	getComments({ interactionId, page })
									//}
									redirectToComment
									userId={userId}
								/>
							</Segment>
						)
					})}
				</Visibility>
			)}
		</div>
	)
}

InteractionComments.propTypes = {
	comments: PropTypes.shape({
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
		hasMore: PropTypes.bool,
		loading: PropTypes.bool,
		page: PropTypes.number,
		results: PropTypes.arrayOf(
			PropTypes.shape({
				comments: PropTypes.shape({
					createdAt: PropTypes.string,
					id: PropTypes.number,
					likeCount: PropTypes.number,
					message: PropTypes.string,
					respones: PropTypes.arrayOf(
						PropTypes.shape({
							createdAt: PropTypes.string,
							id: PropTypes.number,
							likeCount: PropTypes.number,
							message: PropTypes.string,
							userImg: PropTypes.string,
							userName: PropTypes.string,
							userUsername: PropTypes.string
						})
					),
					userImg: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
					userName: PropTypes.string,
					userUsername: PropTypes.string
				}),
				id: PropTypes.number,
				title: PropTypes.string
			})
		)
	}),
	hasMore: PropTypes.bool,
	inverted: PropTypes.bool,
	loading: PropTypes.bool,
	loadMore: PropTypes.func,
	page: PropTypes.number,
	userId: PropTypes.number
}

export default InteractionComments
