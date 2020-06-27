import * as constants from "../constants"
import { changeProfilePicPayload, getUserPayload, searchUsersPayload } from "@interfaces/user"
import axios from "axios"

export const changeProfilePic = ({ bearer, file }: changeProfilePicPayload): void => (dispatch) => {
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

export const getUser = ({ callback = () => null, username }: getUserPayload): void => (
	dispatch
) => {
	axios
		.get(`/api/user/${username}`)
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_USER
			})

			if (!data.error) {
				callback(data.user.id)
			}
		})
		.catch(() => {
			dispatch({
				type: constants.SET_USER_FETCH_ERROR
			})
		})
}

export const searchUsers = ({ page = 0, q = null }: searchUsersPayload): void => (dispatch) => {
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
