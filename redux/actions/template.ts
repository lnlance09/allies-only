import * as constants from "../constants"
import { s3BaseUrl } from "@options/config"
import axios from "axios"

export const getTemplate = ({ callback = () => null, id }) => (dispatch) => {
	axios
		.get(`/api/template/${id}`)
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_TEMPLATE
			})
			const { id, s3Link } = data.template
			callback(id, `${s3BaseUrl}${s3Link}`)
		})
		.catch((error) => {
			dispatch({
				type: constants.SET_TEMPLATE_FETCH_ERROR
			})
		})
}

export const updateTemplate = ({ bearer, callback = () => null, data, id }) => (dispatch) => {
	axios
		.post(`/api/template/${id}/update`, data, {
			headers: {
				Authorization: bearer
			}
		})
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.UPDATE_TEMPLATE
			})
			callback()
		})
		.catch((error) => {
			console.log(error)
		})
}
