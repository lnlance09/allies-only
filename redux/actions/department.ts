import * as constants from "../constants"
import { toast } from "react-toastify"
import { getConfig } from "@options/toast"
import axios from "axios"
import Router from "next/router"

const toastConfig = getConfig()
toast.configure(toastConfig)

export const createDepartment = ({ callback = () => null, city, name }) => (dispatch) => {
	axios
		.post("/api/department/create", {
			city,
			name: name.trim()
		})
		.then((response) => {
			const { data } = response
			if (!data.error) {
				Router.push(`/departments/${data.department.slug}`)
			}
		})
		.catch((error) => {
			toast.error(error.response.data.msg)
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
				callback(data.department.id)
			}
		})
		.catch((error) => {
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
