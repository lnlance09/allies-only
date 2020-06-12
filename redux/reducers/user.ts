import * as constants from "../constants"

const initial = () => ({
	error: false,
	errorMsg: "",
	loading: true,
	user: {
		img: "",
		memes: {
			hasMore: true,
			loading: true,
			page: 0,
			results: [false, false, false, false, false, false]
		},
		templates: {
			hasMore: true,
			loading: true,
			page: 0,
			results: [false, false, false, false, false, false]
		}
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
					memeCount: payload.user.memeCount,
					name: payload.user.name,
					templateCount: payload.user.templateCount,
					username: payload.user.username
				}
			}

		case constants.GET_USER_MEMES:
			let userMemes = payload.memes
			if (payload.page > 1) {
				userMemes = [...state.user.memes.results, ...payload.memes]
			}

			return {
				...state,
				user: {
					...state.user,
					memes: {
						hasMore: payload.hasMore,
						loading: false,
						page: payload.page,
						results: userMemes
					}
				}
			}

		case constants.GET_USER_TEMPLATES:
			let userTemplates = payload.templates
			if (payload.page > 1) {
				userTemplates = [...state.user.templates.results, ...payload.templates]
			}

			return {
				...state,
				user: {
					...state.user,
					templates: {
						hasMore: payload.hasMore,
						loading: false,
						page: payload.page,
						results: userTemplates
					}
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
					memes: {
						hasMore: true,
						loading: true,
						page: 0,
						results: [false, false, false, false, false, false]
					},
					templates: {
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
