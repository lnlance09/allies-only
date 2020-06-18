import * as constants from "../constants"
import { s3BaseUrl } from "@options/config"

const initial = () => ({
	interaction: {
		data: {
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
		results: []
	}
})

const interaction = (state = initial(), action) => {
	const { payload } = action

	switch (action.type) {
		case constants.GET_INTERACTION:
			const { meme } = payload
			if (meme.name === null) {
				meme.name = `Untitled Meme #${meme.id}`
			}
			return {
				...state,
				meme: {
					data: meme,
					error: false,
					errorMsg: "",
					loading: false
				}
			}

		case constants.RESET_INTERACTION_TO_INITIAL:
			return initial()

		case constants.SET_INTERACTION_FETCH_ERROR:
			return {
				...state,
				meme: {
					data: {
						templates: [],
						user: {}
					},
					error: true,
					errorMsg: "This interaction does not exist",
					loading: false
				}
			}

		case constants.UPLOAD_VIDEO:
			return {
				...state,
				interaction: {
					...state.interaction,
					data: {
						...state.interaction.data,
						video: `${s3BaseUrl}${payload.video}`
					}
				}
			}

		case constants.UPDATE_INTERACTION:
			return {
				...state,
				meme: {
					...state.meme,
					data: {
						...state.meme.data,
						caption: payload.meme.caption,
						img: payload.meme.img,
						name: payload.meme.name
					}
				}
			}

		default:
			return state
	}
}

export default interaction
