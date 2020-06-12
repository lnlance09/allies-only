import * as constants from "../constants"
import axios from "axios"

export const searchArtists = ({ page = 0, q }) => (dispatch) => {
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
				type: constants.SEARCH_ARTISTS
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const searchMemes = ({ page = 0, q = null, templateId = null }) => (dispatch) => {
	axios
		.get("/api/meme/search", {
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
				type: constants.SEARCH_MEMES
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const searchTemplates = ({ page = 0, q }) => (dispatch) => {
	axios
		.get("/api/template/search", {
			params: {
				page,
				q
			}
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.SEARCH_TEMPLATES
			})
		})
		.catch((error) => {
			console.log(error)
		})
}
