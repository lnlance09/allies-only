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
			dispatch(getUserMemes({ id }))
			dispatch(getUserTemplates({ id }))
		})
		.catch((error) => {
			dispatch({
				type: constants.SET_USER_FETCH_ERROR
			})
		})
}

export const getUserMemes = ({ id, page = 0 }) => (dispatch) => {
	axios
		.get("/api/meme/search", {
			params: {
				page,
				userId: id
			}
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_USER_MEMES
			})
		})
		.catch((error) => {
			dispatch({
				type: constants.SET_USER_MEMES_FETCH_ERROR
			})
		})
}

export const getUserTemplates = ({ id, page = 0 }) => (dispatch) => {
	axios
		.get("/api/template/search", {
			params: {
				page,
				userId: id
			}
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_USER_TEMPLATES
			})
		})
		.catch((error) => {
			dispatch({
				type: constants.SET_USER_TEMPLATES_FETCH_ERROR
			})
		})
}
