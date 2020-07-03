import * as constants from "../constants"
import { s3BaseUrl } from "@options/config"
import { InitialPageState } from "@interfaces/options"
import { OfficerActionTypes } from "@interfaces/officer"

export const initial: InitialPageState = {
	initialOfficer: {
		data: {},
		error: false,
		errorMsg: "",
		loading: true
	},
	officer: {
		data: {},
		error: false,
		errorMsg: "",
		interactions: {
			error: false,
			errorMsg: "",
			hasMore: false,
			loading: false,
			results: []
		},
		loading: true
	},
	officers: {
		error: false,
		errorMsg: "",
		hasMore: false,
		loading: true,
		results: []
	}
}

const officer = (state = initial, action: OfficerActionTypes): InitialPageState => {
	const { payload } = action

	switch (action.type) {
		case constants.GET_OFFICER:
			const { officer } = payload
			return {
				...state,
				officer: {
					...state.officer,
					data: {
						createdAt: officer.createdAt,
						departmentId: officer.departmentId,
						departmentName: officer.departmentName,
						departmentSlug: officer.departmentSlug,
						firstName: officer.firstName,
						id: officer.id,
						img: officer.img === null ? null : `${s3BaseUrl}${officer.img}`,
						interactionCount: officer.interactionCount,
						lastName: officer.lastName
					},
					error: false,
					errorMsg: "",
					loading: false
				}
			}

		case constants.SEARCH_INTERACTIONS:
			let interactionResults = payload.interactions
			if (payload.page > 1) {
				interactionResults = [
					...state.officer.interactions.results,
					...payload.interactions
				]
			}

			return {
				...state,
				officer: {
					...state.officer,
					interactions: {
						hasMore: payload.hasMore,
						loading: false,
						page: payload.page,
						results: interactionResults
					}
				}
			}

		case constants.SEARCH_OFFICERS:
			let officerResults = payload.officers
			if (payload.page > 1) {
				officerResults = [...state.officers.results, ...payload.officers]
			}

			return {
				...state,
				officers: {
					hasMore: payload.hasMore,
					loading: false,
					page: payload.page,
					results: officerResults
				}
			}

		case constants.SET_OFFICER_CREATE_ERROR:
			return {
				...state,
				officer: {
					data: {},
					error: true,
					errorMsg: payload,
					loading: false
				}
			}

		case constants.SET_OFFICER_FETCH_ERROR:
			return {
				...state,
				officer: {
					data: {},
					error: true,
					errorMsg: "This template does not exist",
					loading: false
				}
			}

		case constants.UPDATE_OFFICER:
			return {
				...state,
				officer: {
					...state.officer,
					data: {
						...state.officer.data,
						img: payload.name
					}
				}
			}

		case constants.UPDATE_OFFICER_IMG:
			return {
				...state,
				officer: {
					...state.officer,
					data: {
						...state.officer.data,
						img: `${s3BaseUrl}${payload.img}`
					}
				}
			}

		default:
			return state
	}
}

export default officer
