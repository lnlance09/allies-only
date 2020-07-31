import * as constants from "../constants"
import { s3BaseUrl } from "@options/config"
import { InitialPageState } from "@interfaces/options"
import { InteractionActionTypes } from "@interfaces/interaction"

export const initial: InitialPageState = {
	initialInteraction: {
		data: {
			department: {},
			officers: [],
			user: {},
			video: null
		},
		error: false,
		errorMsg: "",
		loading: true
	},
	interaction: {
		comments: {
			error: false,
			errorMsg: "",
			hasMore: false,
			loading: true,
			results: []
		},
		data: {
			department: {},
			officers: [],
			user: {},
			video: null
		},
		error: false,
		errorMsg: "",
		loading: true
	},
	interactions: {
		error: false,
		errorMsg: "",
		hasMore: false,
		loading: true,
		results: [{ id: null }, { id: null }, { id: null }, { id: null }]
	}
}

const interaction = (state = initial, action: InteractionActionTypes): InitialPageState => {
	const { payload } = action

	switch (action.type) {
		case constants.GET_COMMENTS:
			if (payload.error) {
				return {
					...state
				}
			}

			let commentResults = payload.comments
			if (payload.page > 1) {
				commentResults = [...state.interaction.comments.results, ...payload.comments]
			}

			return {
				...state,
				interaction: {
					...state.interaction,
					comments: {
						hasMore: payload.hasMore,
						loading: false,
						page: payload.page,
						results: commentResults
					}
				}
			}

		case constants.GET_INTERACTION:
			const { interaction } = payload
			return {
				...state,
				interaction: {
					...state.interaction,
					data: {
						createdAt: interaction.createdAt,
						department: interaction.department,
						description: interaction.description,
						id: interaction.id,
						officers: interaction.officers,
						thumbnail: interaction.thumbnail,
						title: interaction.title,
						user: interaction.user,
						video: interaction.video,
						updatedAt: interaction.updatedAt,
						views: interaction.views
					},
					error: false,
					errorMsg: "",
					loading: false
				}
			}

		case constants.LIKE_COMMENT:
			const { commentId, responseId } = payload
			const comment = state.interaction.comments.results.find(
				(comment) => comment.id === commentId
			)

			if (typeof responseId !== "undefined") {
				const response = comment.responses.find((response) => response.id === responseId)
				response.likeCount++
				response.likedByMe = 1
			} else {
				comment.likeCount++
				comment.likedByMe = 1
			}

			return {
				...state,
				interaction: {
					...state.interaction,
					comments: {
						...state.interaction.comments,
						results: state.interaction.comments.results
					}
				}
			}

		case constants.POST_COMMENT:
			let results = [payload.comment, ...state.interaction.comments.results]
			if (typeof payload.responseTo !== "undefined" && payload.responseTo !== null) {
				const _comment = state.interaction.comments.results.find(
					(comment) => comment.id === payload.responseTo
				)
				_comment.responses.push(payload.comment)
				results = state.interaction.comments.results
			}

			return {
				...state,
				interaction: {
					...state.interaction,
					comments: {
						...state.interaction.comments,
						results
					}
				}
			}

		case constants.RESET_INTERACTION_TO_INITIAL:
			return initial

		case constants.SEARCH_INTERACTIONS:
			let interactionResults = payload.interactions
			if (payload.page > 1) {
				interactionResults = [...state.interactions.results, ...payload.interactions]
			}

			return {
				...state,
				interactions: {
					hasMore: payload.hasMore,
					loading: false,
					page: payload.page,
					results: interactionResults
				}
			}

		case constants.SET_INTERACTION_FETCH_ERROR:
			return {
				...state,
				interaction: {
					data: {
						department: {},
						officers: [],
						user: {},
						video: null
					},
					error: true,
					errorMsg: "This interaction does not exist",
					loading: false
				}
			}

		case constants.SET_VIDEO:
			return {
				...state,
				interaction: {
					...state.interaction,
					data: {
						...state.interaction.data,
						thumbnail: `${s3BaseUrl}${payload.thumbnail}`,
						video: `${s3BaseUrl}${payload.video}`
					}
				}
			}

		case constants.UNLIKE_COMMENT:
			const _commentId = payload.commentId
			const _responseId = payload.responseId
			const _comment = state.interaction.comments.results.find(
				(comment) => comment.id === _commentId
			)

			if (typeof _responseId !== "undefined") {
				const _response = _comment.responses.find((response) => response.id === _responseId)
				_response.likeCount--
				_response.likedByMe = 0
			} else {
				_comment.likeCount--
				_comment.likedByMe = 0
			}

			return {
				...state,
				interaction: {
					...state.interaction,
					comments: {
						...state.interaction.comments,
						results: state.interaction.comments.results
					}
				}
			}

		case constants.UPLOAD_VIDEO:
			return {
				...state,
				interaction: {
					...state.interaction,
					data: {
						...state.interaction.data,
						thumbnail: `${s3BaseUrl}${payload.thumbnail}`,
						video: `${s3BaseUrl}${payload.video}`
					}
				}
			}

		default:
			return state
	}
}

export default interaction
