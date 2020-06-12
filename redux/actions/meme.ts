import * as constants from "../constants"
import axios from "axios"
import Router from "next/router"

export const createMeme = ({ bearer, caption, images }) => (dispatch) => {
	axios
		.post(
			"/api/meme/create",
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
				Router.push(`/meme/${data.id}?download=1`)
			}
		})
		.catch((error) => {
			console.log(error)
		})
}

export const getMeme = ({ callback = () => null, id }) => (dispatch) => {
	axios
		.get(`/api/meme/${id}`)
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_MEME
			})
			callback(data.meme.templates)
		})
		.catch((error) => {
			dispatch({
				type: constants.SET_MEME_FETCH_ERROR
			})
		})
}

export const resetToInitial = () => (dispatch) => {
	dispatch({
		type: constants.RESET_MEME_TO_INITIAL
	})
}

export const updateImg = ({ file, id }) => (dispatch) => {
	axios
		.post(`/api/meme/${id}/updateImg`, {
			file
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.UPDATE_MEME_IMG
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const updateViews = ({ id }) => (dispatch) => {
	axios
		.post(`/api/meme/${id}/updateViews`)
		.then(() => null)
		.catch((error) => {
			console.log(error)
		})
}

export const updateMeme = ({ bearer, callback = () => null, data, id }) => (dispatch) => {
	axios
		.post(`/api/meme/${id}/update`, data, {
			headers: {
				Authorization: bearer
			}
		})
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.UPDATE_MEME
			})
			callback()
		})
		.catch((error) => {
			console.log(error)
		})
}
