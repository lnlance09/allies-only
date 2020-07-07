import { Button, Comment, Form, Icon, TextArea, Visibility } from "semantic-ui-react"
import { s3BaseUrl } from "@options/config"
import { useRouter } from "next/router"
import DefaultPic from "@public/images/avatar/large/joe.jpg"
import LinkedText from "@components/linkedText"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { useRef, useState, Fragment } from "react"
import ReactTooltip from "react-tooltip"

const CommentsSection: React.FC = ({
	authenticated,
	bearer,
	comments,
	interactionId,
	inverted,
	likeComment,
	loadMoreComments,
	postComment,
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

	return (
		<div className="commentsSection">
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

			<Visibility
				continuous
				onBottomVisible={async () => {
					if (comments.hasMore && !fetching) {
						setFetching(true)
						await loadMoreComments({ interactionId, page: comments.page })
						setFetching(false)
					}
				}}
			>
				{comments.results.length > 0 ? (
					<Comment.Group size="big">
						{comments.results.map((comment, i) => (
							<Comment key={`individualComment${i}`}>
								<Comment.Avatar
									as="a"
									data-for={`individualComment${i}`}
									data-iscapture="true"
									data-tip={`${comment.userName}`}
									onClick={() => router.push(`/${comment.userUsername}`)}
									onError={(i) => (i.target.src = DefaultPic)}
									size="tiny"
									src={
										comment.userImg
											? `${s3BaseUrl}${comment.userImg}`
											: DefaultPic
									}
								/>
								<Comment.Content>
									<Comment.Author
										as="a"
										onClick={() => router.push(`/${comment.userUsername}`)}
									>
										{comment.userUsername}
									</Comment.Author>
									<Comment.Metadata>
										<div>
											<Moment date={comment.createdAt} fromNow />
										</div>
									</Comment.Metadata>
									<Comment.Text>
										<LinkedText text={comment.message} />
									</Comment.Text>
									<Comment.Actions>
										<Comment.Action>
											<span
												className={comment.likedByMe === 1 ? "liked" : ""}
												onClick={() => {
													likeComment({
														bearer,
														commentId: comment.id
													})
												}}
											>
												<Icon
													color={
														comment.likedByMe === 1 ? "yellow" : null
													}
													inverted={inverted}
													name="thumbs up"
												/>{" "}
												{comment.likedByMe === 1 ? "Liked" : "Like"}
											</span>
											{comment.likeCount > 0 && (
												<span
													className={`count ${
														comment.likedByMe === 1 ? "liked" : ""
													}`}
												>
													{" "}
													{comment.likeCount}
												</span>
											)}
										</Comment.Action>
										<Comment.Action>
											<span
												onClick={() => {
													setMessage(`@${comment.userUsername} `)
													setResponseTo(comment.id)
													window.scrollTo({
														behavior: "smooth",
														top: blockRef.current.offsetTop
													})
													textAreaRef.current.focus()
												}}
											>
												<Icon inverted={inverted} name="reply" /> Reply
											</span>
											{comment.replyCount > 0 && (
												<span className="count">{comment.replyCount}</span>
											)}
										</Comment.Action>
									</Comment.Actions>
								</Comment.Content>

								<ReactTooltip
									className="tooltipClass"
									effect="solid"
									id={`individualComment${i}`}
									multiline={false}
									place="left"
									type="light"
								/>

								{comment.responses.length > 0 && (
									<Comment.Group size="big">
										{comment.responses.map((response, x) => (
											<Comment key={`replyComment${x}`}>
												<Comment.Avatar
													as="a"
													data-for={`responseComment${i}`}
													data-iscapture="true"
													data-tip={`${JSON.parse(response.userName)}`}
													onClick={() =>
														router.push(
															`/${JSON.parse(response.userUsername)}`
														)
													}
													onError={(i) => (i.target.src = DefaultPic)}
													size="tiny"
													src={
														response.userImg
															? `${s3BaseUrl}${JSON.parse(
																	response.userImg
															  )}`
															: DefaultPic
													}
												/>
												<Comment.Content>
													<Comment.Author
														as="a"
														onClick={() =>
															router.push(
																`/${JSON.parse(
																	response.userUsername
																)}`
															)
														}
													>
														{JSON.parse(response.userUsername)}
													</Comment.Author>
													<Comment.Metadata>
														<div>
															<Moment
																date={response.createdAt}
																fromNow
															/>
														</div>
													</Comment.Metadata>
													<Comment.Text>
														<LinkedText
															text={JSON.parse(response.message)}
														/>
													</Comment.Text>
													<Comment.Actions>
														<Comment.Action>
															<span
																className={
																	response.likedByMe === 1
																		? "liked"
																		: ""
																}
																onClick={() => {
																	likeComment({
																		bearer,
																		commentId: comment.id,
																		responseId: response.id
																	})
																}}
															>
																<Icon
																	color={
																		response.likedByMe === 1
																			? "yellow"
																			: null
																	}
																	inverted={inverted}
																	name="thumbs up"
																/>{" "}
																Like
															</span>
															{response.likeCount > 0 && (
																<span
																	className={`count ${
																		response.likedByMe === 1
																			? "liked"
																			: ""
																	}`}
																>
																	{" "}
																	{response.likeCount}
																</span>
															)}
														</Comment.Action>
														<Comment.Action>
															<span
																onClick={() => {
																	setMessage(
																		`@${JSON.parse(
																			response.userUsername
																		)} `
																	)
																	setResponseTo(comment.id)
																	window.scrollTo({
																		behavior: "smooth",
																		top:
																			blockRef.current
																				.offsetTop
																	})
																	textAreaRef.current.focus()
																}}
															>
																<Icon
																	inverted={inverted}
																	name="reply"
																/>{" "}
																Reply
															</span>
															{response.responseCount > 0 && (
																<span className="count">
																	{response.responseCount}
																</span>
															)}
														</Comment.Action>
													</Comment.Actions>
												</Comment.Content>

												<ReactTooltip
													className="tooltipClass"
													effect="solid"
													id={`responseComment${i}`}
													multiline={false}
													place="left"
													type="light"
												/>
											</Comment>
										))}
									</Comment.Group>
								)}
							</Comment>
						))}
					</Comment.Group>
				) : (
					<Fragment>
						{/*
					<Segment inverted={inverted} placeholder>
						<Header icon textAlign="center">
							<Icon color="yellow" inverted={inverted} name="comment" />
							There aren&apos;t any comments yet
						</Header>
					</Segment>
					*/}
					</Fragment>
				)}
			</Visibility>
		</div>
	)
}

CommentsSection.propTypes = {
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
	unlikeComment: PropTypes.func,
	userId: PropTypes.number
}

export default CommentsSection
