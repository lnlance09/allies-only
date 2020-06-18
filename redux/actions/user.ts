import * as constants from "../constants"
import axios from "axios"

export const changeProfilePic = ({ bearer, file }) => (dispatch) => {
	const formData = new FormData()
	formData.set("file", file)

	axios
		.post("/api/user/changeProfilePic", formData, {
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
				type: constants.CHANGE_PROFILE_PIC
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const getInteractions = ({ page = 0, userId = null }) => (dispatch) => {
	axios
		.get("/api/interaction/search", {
			params: {
				page,
				userId
			}
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_USER_INTERACTIONS
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const getUser = ({ username }) => (dispatch) => {
	axios
		.get(`/api/user/${username}`)
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_USER
			})

			const id = data.user.id
			dispatch(getInteractions({ userId: id }))
		})
		.catch(() => {
			dispatch({
				type: constants.SET_USER_FETCH_ERROR
			})
		})
}

export const searchUsers = ({ page = 0, q = null }) => (dispatch) => {
	axios
		.get("/api/user/search", {
			params: {
				page,
				q
			}
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.SEARCH_USERS
			})
		})
		.catch(() => {
			dispatch({
				type: constants.SET_USER_FETCH_ERROR
			})
		})
}
