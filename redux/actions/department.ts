import * as constants from "../constants"
import { toast } from "react-toastify"
import { getConfig } from "@options/toast"
import {
	CreateDepartmentAction,
	CreateDepartmentPayload,
	GetDepartmentAction,
	SearchDepartmentsAction,
	SetDepartmentErrorAction,
	UpdateDepartmentAction,
	UpdateDepartmentPayload
} from "@interfaces/department"
import { GetItemPayload, PaginationPayload } from "@interfaces/options"
import { AppDispatch } from "@store/index"
import axios from "axios"
import Router from "next/router"

const toastConfig = getConfig()
toast.configure(toastConfig)

export const changeDepartmentPic = ({ bearer, file, id }) => (dispatch: AppDispatch) => {
	const formData = new FormData()
	formData.set("file", file)
	formData.set("id", id)

	axios
		.post("/api/department/changePic", formData, {
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
				type: constants.CHANGE_DEPARTMENT_PIC
			})
		})
		.catch((error) => {
			toast.error(error.response.data.msg)
		})
}

export const createDepartment = ({
	callback = () => null,
	city,
	name
}: CreateDepartmentPayload): CreateDepartmentAction => (dispatch: AppDispatch) => {
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

export const getDepartment = ({
	callback = () => null,
	id
}: GetItemPayload): GetDepartmentAction | SetDepartmentErrorAction => (dispatch: AppDispatch) => {
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
		.catch(() => {
			dispatch({
				type: constants.SET_DEPARTMENT_FETCH_ERROR
			})
		})
}

export const searchDepartments = ({
	callback = () => null,
	page = 0,
	q
}: PaginationPayload): SearchDepartmentsAction => (dispatch: AppDispatch) => {
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
			callback()
		})
		.catch((error) => {
			console.log(error)
		})
}

export const updateDepartment = ({
	bearer,
	callback = () => null,
	data,
	id
}: UpdateDepartmentPayload): UpdateDepartmentAction => (dispatch: AppDispatch) => {
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
