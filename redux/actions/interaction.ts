import * as constants from "../constants"
import axios from "axios"
import Router from "next/router"

export const createInteraction = ({ bearer, caption, images }) => (dispatch) => {
	axios
		.post(
			"/api/interaction/create",
			{
				caption,
				images
			},
			{
				headers: {
					Authorization: bearer
				}
			}
		)
		.then(async (response) => {
			const { data } = response
			if (!data.error) {
				Router.push(`/interaction/${data.id}`)
			}
		})
		.catch((error) => {
			console.log(error)
		})
}

export const getInteraction = ({ callback = () => null, id }) => (dispatch) => {
	axios
		.get(`/api/interaction/${id}`)
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_INTERACTION
			})
			callback()
		})
		.catch((error) => {
			dispatch({
				type: constants.SET_INTERACTION_FETCH_ERROR
			})
		})
}

export const resetToInitial = () => (dispatch) => {
	dispatch({
		type: constants.RESET_INTERACTION_TO_INITIAL
	})
}

export const searchInteractions = ({ departmentId, page = 0, q = nulll }) => (dispatch) => {
	axios
		.get("/api/interaction/search", {
			params: {
				departmentId,
				page,
				q
			}
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.SEARCH_INTERACTIONS
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const updateViews = ({ id }) => (dispatch) => {
	axios
		.post(`/api/interaction/${id}/updateViews`)
		.then(() => null)
		.catch((error) => {
			console.log(error)
		})
}

export const updateInteraction = ({ bearer, callback = () => null, data, id }) => (dispatch) => {
	axios
		.post(`/api/interaction/${id}/update`, data, {
			headers: {
				Authorization: bearer
			}
		})
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.UPDATE_INTERACTION
			})
			callback()
		})
		.catch((error) => {
			console.log(error)
		})
}
