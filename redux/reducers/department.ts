import * as constants from "../constants"
import { InitialPageState } from "@interfaces/options"
import { DepartmentActionTypes } from "@interfaces/department"

export const initial: InitialPageState = {
	department: {
		data: {},
		error: false,
		errorMsg: "",
		interactions: {
			error: false,
			errorMsg: "",
			hasMore: false,
			loading: true,
			results: []
		},
		loading: true,
		officers: {
			error: false,
			errorMsg: "",
			hasMore: false,
			loading: true,
			results: []
		}
	},
	departments: {
		error: false,
		errorMsg: "",
		hasMore: false,
		loading: true,
		results: []
	},
	initialDepartment: {
		data: {},
		error: false,
		errorMsg: "",
		loading: true
	}
}

const department = (state = initial, action: DepartmentActionTypes): InitialPageState => {
	const { payload } = action

	switch (action.type) {
		case constants.GET_DEPARTMENT:
			const { department } = payload
			return {
				...state,
				department: {
					...state.department,
					data: department,
					error: false,
					errorMsg: "",
					loading: false
				}
			}

		case constants.RESET_DEPARTMENT_TO_INITIAL:
			return initial

		case constants.SEARCH_DEPARTMENTS:
			let departmentResults = payload.departments
			if (payload.page > 1) {
				departmentResults = [...state.departments.results, ...payload.departments]
			}

			return {
				...state,
				departments: {
					hasMore: payload.hasMore,
					loading: false,
					page: payload.page,
					results: departmentResults
				}
			}

		case constants.SEARCH_INTERACTIONS:
			let interactionResults = payload.interactions
			if (payload.page > 1) {
				interactionResults = [
					...state.department.interactions.results,
					...payload.interactions
				]
			}

			return {
				...state,
				department: {
					...state.department,
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
				officerResults = [...state.department.officers.results, ...payload.officers]
			}

			return {
				...state,
				department: {
					...state.department,
					officers: {
						hasMore: payload.hasMore,
						loading: false,
						page: payload.page,
						results: officerResults
					}
				}
			}

		case constants.SET_DEPARTMENT_CREATE_ERROR:
			return {
				...state,
				department: {
					data: {
						user: {}
					},
					error: true,
					errorMsg: payload,
					loading: false
				}
			}

		case constants.SET_DEPARTMENT_FETCH_ERROR:
			return {
				...state,
				department: {
					data: {
						user: {}
					},
					error: true,
					errorMsg: "This department does not exist",
					loading: false
				}
			}

		case constants.UPDATE_DEPARTMENT:
			return {
				...state,
				department: {
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

export default department
