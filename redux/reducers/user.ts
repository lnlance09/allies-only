import * as constants from "../constants"
import { InitialPageState } from "@interfaces/options"
import { UserActionTypes } from "@interfaces/user"

export const initial: InitialPageState = {
	initialUser: {
		data: {},
		error: false,
		errorMsg: "",
		loading: true
	},
	user: {
		comments: {
			hasMore: true,
			loading: true,
			page: 0,
			results: []
		},
		data: {},
		error: false,
		errorMsg: "",
		interactions: {
			hasMore: true,
			loading: true,
			page: 0,
			results: []
		},
		loading: true
	},
	users: {
		error: false,
		errorMsg: "",
		hasMore: false,
		loading: true,
		results: []
	}
}

const user = (state = initial, action: UserActionTypes): InitialPageState => {
	const { payload } = action

	switch (action.type) {
		case constants.CHANGE_PROFILE_PIC:
			return {
				...state,
				user: {
					...state.user,
					data: {
						...state.user.data,
						img: payload.img
					}
				}
			}

		case constants.GET_USER:
			return {
				...state,
				user: {
					...state.user,
					data: {
						bio: payload.user.bio === null ? "" : payload.user.bio,
						commentCount: payload.user.commentCount,
						createdAt: payload.user.createdAt,
						id: payload.user.id,
						img: payload.user.img,
						interactionCount: payload.user.interactionCount,
						name: payload.user.name,
						status: payload.user.race,
						username: payload.user.username
					},
					error: false,
					loading: false
				}
			}

		case constants.GET_USER_COMMENTS:
			if (payload.error) {
				return {
					...state
				}
			}

			let commentResults = payload.comments
			if (payload.page > 1) {
				commentResults = [...state.user.comments.results, ...payload.comments]
			}

			return {
				...state,
				user: {
					...state.user,
					comments: {
						hasMore: payload.hasMore,
						loading: false,
						page: payload.page,
						results: commentResults
					}
				}
			}

		case constants.SEARCH_INTERACTIONS:
			let userInteractions = payload.interactions
			if (payload.page > 1) {
				userInteractions = [...state.user.interactions.results, ...payload.interactions]
			}

			return {
				...state,
				user: {
					...state.user,
					interactions: {
						hasMore: payload.hasMore,
						loading: false,
						page: payload.page,
						results: userInteractions
					}
				}
			}

		case constants.SEARCH_USERS:
			let userResults = payload.users
			if (payload.page > 1) {
				userResults = [...state.users.results, ...payload.users]
			}

			return {
				...state,
				users: {
					hasMore: payload.hasMore,
					loading: false,
					page: payload.page,
					results: userResults
				}
			}

		case constants.SET_USER_FETCH_ERROR:
			return initial

		case constants.UPDATE_USER:
			return {
				...state,
				user: {
					...state.user,
					data: {
						...state.user.data,
						bio: payload.bio
					}
				}
			}

		default:
			return state
	}
}

export default user
