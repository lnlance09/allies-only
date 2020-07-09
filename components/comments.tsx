import {
	Button,
	Comment,
	Header,
	Form,
	Icon,
	Segment,
	TextArea,
	Visibility
} from "semantic-ui-react"
import { formatTimestamp } from "@utils/textFunctions"
import { s3BaseUrl } from "@options/config"
import { useRouter } from "next/router"
import DefaultPic from "@public/images/avatar/large/joe.jpg"
import LinkedText from "@components/linkedText"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { useRef, useState, Fragment } from "react"
import ReactTooltip from "react-tooltip"

const CommentsSection: React.FC = ({
	allowNewPosts,
	authenticated,
	bearer,
	comments,
	interactionId,
	inverted,
	likeComment,
	loadMoreComments,
	postComment,
	showNoResultsMsg,
	showReplies,
	unlikeComment,
	userId
}) => {
	const router = useRouter()
	const blockRef = useRef(null)
	const textAreaRef = useRef(null)

	const [fetching, setFetching] = useState(false)
	const [message, setMessage] = useState("")
	const [responseTo, setResponseTo] = useState(null)

	const onChangeMessage = (e, { value }) => {
		setMessage(value)

		if (message === "") {
			setResponseTo(null)
		}
	}

	const SingleComment = (comment, commentId: number, isReply: boolean, key: string) => {
		const { createdAt, id, likeCount, likedByMe, message, userImg } = comment
		const username = comment.userUsername

		return (
			<Fragment>
				<Comment.Avatar
					as="a"
					data-for={key}
					data-iscapture="true"
					data-tip={`${username}`}
					onClick={() => router.push(`/${username}`)}
					onError={(i) => (i.target.src = DefaultPic)}
					size="tiny"
					src={userImg ? `${s3BaseUrl}${userImg}` : DefaultPic}
				/>
				<Comment.Content>
					<Comment.Author as="a" onClick={() => router.push(`/${username}`)}>
						{username}
					</Comment.Author>
					<Comment.Metadata>
						<div>
							<Moment
								date={isReply ? formatTimestamp(createdAt) : createdAt}
								fromNow
							/>
						</div>
					</Comment.Metadata>
					<Comment.Text>
						<LinkedText text={message} />
					</Comment.Text>
					<Comment.Actions>
						<Comment.Action>
							<span
								onClick={() => {
									if (!authenticated) {
										router.push("/signin?type=join")
										return
									}

									const payload = {
										bearer,
										commentId: id
									}

									if (isReply) {
										payload.commentId = commentId
										payload.responseId = id
									}

									if (likedByMe === 1) {
										unlikeComment(payload)
									} else {
										likeComment(payload)
									}
								}}
							>
								<Icon
									color={likedByMe === 1 ? "yellow" : null}
									inverted={inverted}
									name="thumbs up"
								/>{" "}
								{likedByMe === 1 ? (
									<span className="likeThis">Liked</span>
								) : (
									<span>Like</span>
								)}
							</span>
							{likeCount > 0 && <span className={`count`}>{likeCount}</span>}
						</Comment.Action>
						<Comment.Action>
							<span
								onClick={() => {
									setMessage(`@${username} `)
									setResponseTo(commentId)
									window.scrollTo({
										behavior: "smooth",
										top: blockRef.current.offsetTop
									})
									textAreaRef.current.focus()
								}}
							>
								<Icon inverted={inverted} name="reply" /> Reply
							</span>
						</Comment.Action>
					</Comment.Actions>
				</Comment.Content>

				<ReactTooltip
					className="tooltipClass"
					effect="solid"
					id={key}
					multiline={false}
					place="left"
					type="light"
				/>
			</Fragment>
		)
	}

	return (
		<div className="commentsSection">
			{allowNewPosts && (
				<div ref={blockRef}>
					<Form className="lighter" inverted={inverted} size="big">
						<TextArea
							autoHeight
							onChange={onChangeMessage}
							placeholder="Post a comment"
							ref={textAreaRef}
							value={message}
						/>
						<Button
							className="postCommentButton"
							color="orange"
							content="Post"
							disabled={message.length === 0}
							fluid
							onClick={() => {
								postComment({
									bearer,
									callback: () => setMessage(""),
									interactionId,
									message,
									responseTo
								})
							}}
							size="big"
						/>
					</Form>
				</div>
			)}

			<Visibility
				continuous
				onBottomVisible={async () => {
					if (comments.hasMore && !fetching) {
						setFetching(true)
						await loadMoreComments({ interactionId, page: comments.page, userId })
						setFetching(false)
					}
				}}
			>
				{comments.results.length > 0 ? (
					<Comment.Group size="big">
						{comments.results.map((comment, i) => (
							<Comment key={`individualComment${i}`}>
								{SingleComment(comment, comment.id, false, `individualComment${i}`)}

								{comment.responses.length > 0 && showReplies && (
									<Comment.Group size="big">
										{comment.responses.map((response, x) => (
											<Comment key={`replyComment${x}`}>
												{SingleComment(
													response,
													comment.id,
													true,
													`replyComment${i}`
												)}
											</Comment>
										))}
									</Comment.Group>
								)}
							</Comment>
						))}
					</Comment.Group>
				) : (
					<Fragment>
						{showNoResultsMsg && (
							<Segment inverted={inverted} placeholder>
								<Header icon textAlign="center">
									<Icon color="yellow" inverted={inverted} name="comment" />
									There aren&apos;t any comments yet
								</Header>
							</Segment>
						)}
					</Fragment>
				)}
			</Visibility>
		</div>
	)
}

CommentsSection.propTypes = {
	allowNewPosts: PropTypes.bool,
	authenticated: PropTypes.bool,
	bearer: PropTypes.string,
	comments: PropTypes.shape({
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
		hasMore: PropTypes.bool,
		loading: PropTypes.bool,
		page: PropTypes.number,
		results: PropTypes.arrayOf(
			PropTypes.shape({
				createdAt: PropTypes.string,
				interactionId: PropTypes.number,
				likeCount: PropTypes.number,
				likedByMe: PropTypes.number,
				message: PropTypes.string,
				respones: PropTypes.arrayOf(
					PropTypes.shape({
						createdAt: PropTypes.string,
						id: PropTypes.number,
						likeCount: PropTypes.number,
						likedByMe: PropTypes.number,
						message: PropTypes.string,
						userImg: PropTypes.string,
						userName: PropTypes.string,
						userUsername: PropTypes.string
					})
				),
				responseTo: PropTypes.number,
				updatedAt: PropTypes.string,
				userImg: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
				userName: PropTypes.string,
				userUsername: PropTypes.string
			})
		)
	}),
	interactionId: PropTypes.number,
	inverted: PropTypes.bool,
	likeComment: PropTypes.func,
	loadMoreComments: PropTypes.func,
	postComment: PropTypes.func,
	showNoResultsMsg: PropTypes.bool,
	showReplies: PropTypes.bool,
	unlikeComment: PropTypes.func,
	userId: PropTypes.number
}

CommentsSection.defaultProps = {
	allowNewPosts: true,
	showNoResultsMsg: false,
	showReplies: true
}

export default CommentsSection
