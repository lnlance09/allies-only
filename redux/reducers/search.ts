import * as constants from "../constants"

const initial = () => ({
	artists: {
		hasMore: true,
		loading: true,
		page: 0,
		results: [false, false, false, false, false, false]
	},
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
})

const search = (state = initial(), action) => {
	const { payload } = action

	switch (action.type) {
		case constants.SEARCH_ARTISTS:
			let artistResults = payload.users
			if (payload.page > 1) {
				artistResults = [...state.artists.results, ...payload.users]
			}

			return {
				...state,
				artists: {
					hasMore: payload.hasMore,
					loading: false,
					page: payload.page,
					results: artistResults
				}
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

		case constants.SEARCH_TEMPLATES:
			let templateResults = payload.templates
			if (payload.page > 1) {
				templateResults = [...state.templates.results, ...payload.templates]
			}

			return {
				...state,
				templates: {
					hasMore: payload.hasMore,
					loading: false,
					page: payload.page,
					results: templateResults
				}
			}

		default:
			return state
	}
}

export default search
