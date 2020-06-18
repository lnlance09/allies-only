import * as constants from "../constants"

const initial = () => ({
	error: false,
	errorMsg: "",
	loading: true,
	user: {
		img: "",
		interactions: {
			hasMore: true,
			loading: true,
			page: 0,
			results: [false, false, false, false, false, false]
		}
	},
	users: {
		error: false,
		errorMsg: "",
		hasMore: false,
		loading: true,
		results: []
	}
})

const user = (state = initial(), action) => {
	const { payload } = action

	switch (action.type) {
		case constants.CHANGE_PROFILE_PIC:
			return {
				...state,
				user: {
					...state.user,
					img: payload.img
				}
			}

		case constants.GET_USER:
			return {
				...state,
				error: false,
				loading: false,
				user: {
					...state.user,
					createdAt: payload.user.createdAt,
					id: payload.user.id,
					img: payload.user.img,
					interactionCount: payload.user.interactionCount,
					name: payload.user.name,
					status: payload.user.race,
					username: payload.user.username
				}
			}

		case constants.GET_USER_INTERACTIONS:
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
			return {
				...state,
				error: true,
				errorMsg: "This user does not exist",
				loading: false,
				user: {
					img: "",
					interactions: {
						hasMore: true,
						loading: true,
						page: 0,
						results: [false, false, false, false, false, false]
					}
				}
			}

		default:
			return state
	}
}

export default user
