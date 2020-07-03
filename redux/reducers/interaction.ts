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
		results: []
	}
}

const interaction = (state = initial, action: InteractionActionTypes): InitialPageState => {
	const { payload } = action

	switch (action.type) {
		case constants.GET_INTERACTION:
			const { interaction } = payload
			return {
				...state,
				interaction: {
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
						views: interaction.views
					},
					error: false,
					errorMsg: "",
					loading: false
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
