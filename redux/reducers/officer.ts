import * as constants from "../constants"

const initial = () => ({
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
		loading: false
	},
	officers: {
		error: false,
		errorMsg: "",
		hasMore: false,
		loading: true,
		results: []
	}
})

const officer = (state = initial(), action) => {
	const { payload } = action

	switch (action.type) {
		case constants.GET_OFFICER:
			return {
				...state,
				officer: {
					...state.officer,
					data: {
						createdAt: payload.officer.createdAt,
						departmentId: payload.officer.departmentId,
						departmentName: payload.officer.departmentName,
						firstName: payload.officer.firstName,
						id: payload.officer.templateId,
						img: payload.officer.img,
						interactionCount: payload.officer.memeCount,
						lastName: payload.officer.lastName
					},
					error: false,
					errorMsg: "",
					loading: false
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
				data: {},
				error: true,
				errorMsg: "This template does not exist",
				loading: false
			}

		case constants.UPDATE_OFFICER:
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

export default officer
