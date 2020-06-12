import * as constants from "../constants"

const initial = () => ({
	data: {
		user: {}
	},
	error: false,
	errorMsg: "",
	loading: true,
	memes: {
		hasMore: true,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	}
})

const template = (state = initial(), action) => {
	const { payload } = action

	switch (action.type) {
		case constants.GET_TEMPLATE:
			return {
				...state,
				data: {
					createdAt: payload.template.createdAt,
					id: payload.template.templateId,
					memeCount: payload.template.memeCount,
					name: payload.template.templateName,
					s3Link: payload.template.s3Link,
					user: {
						id: payload.template.id,
						img: payload.template.img,
						name: payload.template.name,
						username: payload.template.username
					}
				},
				error: false,
				errorMsg: "",
				loading: false
			}

		case constants.SEARCH_MEMES:
			let memeResults = payload.memes
			if (payload.page > 1) {
				memeResults = [...state.memes.results, ...payload.memes]
			}

			return {
				...state,
				memes: {
					hasMore: payload.hasMore,
					loading: false,
					page: payload.page,
					results: memeResults
				}
			}

		case constants.SET_TEMPLATE_FETCH_ERROR:
			return {
				...state,
				data: {
					user: {}
				},
				error: true,
				errorMsg: "This template does not exist",
				loading: false
			}

		case constants.UPDATE_TEMPLATE:
			return {
				...state,
				data: {
					...state.data,
					name: payload.template.name
				}
			}

		default:
			return state
	}
}

export default template
