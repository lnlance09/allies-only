import * as constants from "../constants"
import { toast } from "react-toastify"
import axios from "axios"
import Router from "next/router"

toast.configure({
	autoClose: 2000,
	closeOnClick: true,
	draggable: true,
	hideProgressBar: true,
	newestOnTop: true,
	position: "bottom-left"
})

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
		.then((response) => {
			const { data } = response
			if (!data.error && data.officer) {
				Router.push(`/officers/${data.officer.slug}`)
			}
		})
		.catch((error) => {
			callback()
			toast.error(error.response.data.msg)

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

			if (!data.error) {
				callback(data.officer.id)
			}
		})
		.catch(() => {
			dispatch({
				type: constants.SET_OFFICER_FETCH_ERROR
			})
		})
}

export const searchOfficers = ({ departmentId = null, page = 0, q = null }) => (dispatch) => {
	axios
		.get("/api/officer/search", {
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

export const updateImg = ({ bearer, file, id }) => (dispatch) => {
	const formData = new FormData()
	formData.set("file", file)

	axios
		.post(`/api/officer/${id}/updateImg`, formData, {
			headers: {
				Authorization: bearer,
				"Content-Type": "multipart/form-data",
				enctype: "multipart/form-data"
			}
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
