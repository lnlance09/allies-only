import * as constants from "../constants"
import { s3BaseUrl } from "@options/config"
import axios from "axios"
import Router from "next/router"

export const createDepartment = ({ callback = () => null, city, name }) => (dispatch) => {
	axios
		.post("/api/department/create", {
			city,
			name
		})
		.then((response) => {
			const { data } = response
			if (!data.error) {
				Router.push(`/departments/${data.id}`)
			}
		})
		.catch((error) => {
			callback()
			dispatch({
				payload: error.response.data.msg,
				type: constants.SET_DEPARTMENT_CREATE_ERROR
			})
		})
}

export const getDepartment = ({ callback = () => null, id }) => (dispatch) => {
	axios
		.get(`/api/department/${id}`)
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_DEPARTMENT
			})

			if (!data.error) {
				console.log("callback")
				callback(data.department.id)
			}
		})
		.catch((error) => {
			console.log("error", error)
			dispatch({
				type: constants.SET_DEPARTMENT_FETCH_ERROR
			})
		})
}

export const searchDepartments = ({ page = 0, q }) => (dispatch) => {
	axios
		.get("/api/department/search", {
			params: {
				page,
				q
			}
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.SEARCH_DEPARTMENTS
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const updateDepartment = ({ bearer, callback = () => null, data, id }) => (dispatch) => {
	axios
		.post(`/api/department/${id}/update`, data, {
			headers: {
				Authorization: bearer
			}
		})
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.UPDATE_DEPARTMENT
			})
			callback()
		})
		.catch((error) => {
			console.log(error)
		})
}
