import * as constants from "../constants"
import axios from "axios"
import Router from "next/router"

export const createOfficer = ({
	bearer,
	callback = () => null,
	department,
	firstName,
	lastName
}) => (dispatch) => {
	axios
		.post(
			"/api/officer/create",
			{
				department,
				firstName,
				lastName
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
				Router.push(`/officer/${data.officer.slug}`)
			}
		})
		.catch((error) => {
			callback()
			dispatch({
				payload: error.response.data.msg,
				type: constants.SET_OFFICER_CREATE_ERROR
			})
		})
}

export const getOfficer = ({ callback = () => null, id }) => (dispatch) => {
	axios
		.get(`/api/officer/${id}`)
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_OFFICER
			})
			callback()
		})
		.catch(() => {
			dispatch({
				type: constants.SET_OFFICER_FETCH_ERROR
			})
		})
}

export const searchOfficers = ({ page = 0, q = null, templateId = null }) => (dispatch) => {
	axios
		.get("/api/officer/search", {
			params: {
				page,
				q,
				templateId
			}
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.SEARCH_OFFICERS
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const resetToInitial = () => (dispatch) => {
	dispatch({
		type: constants.RESET_OFFICER_TO_INITIAL
	})
}

export const updateImg = ({ file, id }) => (dispatch) => {
	axios
		.post(`/api/officer/${id}/updateImg`, {
			file
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.UPDATE_OFFICER_IMG
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const updateOfficer = ({ bearer, callback = () => null, data, id }) => (dispatch) => {
	axios
		.post(`/api/officer/${id}/update`, data, {
			headers: {
				Authorization: bearer
			}
		})
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.UPDATE_OFFICER
			})
			callback()
		})
		.catch((error) => {
			console.log(error)
		})
}
