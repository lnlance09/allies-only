import * as constants from "../constants"
import { toast } from "react-toastify"
import { getConfig } from "@options/toast"
import {
	CreateInteractionPayload,
	GetInteractionAction,
	Interaction,
	ResetInteractionAction,
	SearchInteractionsAction,
	SetVideoAction,
	SetVideoPayload,
	UpdateViewsPayload,
	UploadVideoPayload
} from "@interfaces/interaction"
import { GetItemPayload, PaginationPayload } from "@interfaces/options"
import { AppDispatch } from "@store"
import axios from "axios"
import Router from "next/router"

const toastConfig = getConfig()
toast.configure(toastConfig)

export const createInteraction = ({
	bearer,
	callback = () => null,
	department,
	description,
	file,
	officer,
	thumbnail,
	title
}: CreateInteractionPayload) => (): void => {
	const formData = new FormData()
	formData.set("department", department)
	formData.set("description", description)
	formData.set("file", file)
	formData.set("officer", JSON.stringify(officer))
	formData.set("thumbnail", thumbnail)
	formData.set("title", title)

	axios
		.post("/api/interaction/create", formData, {
			headers: {
				Authorization: bearer,
				"Content-Type": "multipart/form-data",
				enctype: "multipart/form-data"
			}
		})
		.then(async (response) => {
			const { data } = response
			if (!data.error) {
				Router.push(`/interactions/${data.id}`)
			}
		})
		.catch((error) => {
			callback()
			toast.error(error.response.data.msg)
		})
}

export const getInteraction = ({
	callback = () => null,
	id
}: GetItemPayload): GetInteractionAction => (dispatch: AppDispatch) => {
	axios
		.get(`/api/interaction/${id}`)
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_INTERACTION
			})

			if (!data.error) {
				const { interaction } = data
				callback(interaction.department.id, interaction.description, interaction.officers)
			}
		})
		.catch(() => {
			dispatch({
				type: constants.SET_INTERACTION_FETCH_ERROR
			})
		})
}

export const resetToInitial = (): ResetInteractionAction => (dispatch: AppDispatch) => {
	dispatch({
		type: constants.RESET_INTERACTION_TO_INITIAL
	})
}

export const searchInteractions = ({
	departmentId,
	exclude,
	officerId,
	page = 0,
	q = null,
	userId
}: PaginationPayload): SearchInteractionsAction => (dispatch: AppDispatch) => {
	axios
		.get("/api/interaction/search", {
			params: {
				departmentId,
				exclude,
				officerId,
				page,
				q,
				userId
			}
		})
		.then((response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.SEARCH_INTERACTIONS
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const setVideo = ({ thumbnail, video }: SetVideoPayload): SetVideoAction => (
	dispatch: AppDispatch
) => {
	dispatch({
		payload: {
			thumbnail,
			video
		},
		type: constants.SET_VIDEO
	})
}

export const updateInteraction = ({
	bearer,
	callback = () => null,
	department,
	description,
	id,
	officer
}: CreateInteractionPayload): void => () => {
	axios
		.post(
			`/api/interaction/${id}/update`,
			{
				department,
				description,
				officer: JSON.stringify(officer)
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
				callback(id)
			}
		})
		.catch((error) => {
			console.log(error)
		})
}

export const updateViews = ({ id }: UpdateViewsPayload): void => () => {
	axios
		.post(`/api/interaction/${id}/updateViews`)
		.then(() => null)
		.catch((error) => {
			console.log(error)
		})
}

export const uploadVideo = ({ callback = () => null, file }: UploadVideoPayload): Interaction => (
	dispatch: AppDispatch
) => {
	const formData = new FormData()
	formData.set("file", file)

	axios
		.post("/api/interaction/uploadVideo", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				enctype: "multipart/form-data"
			}
		})
		.then(async (response) => {
			const { data } = response

			if (!data.error) {
				callback()
			}

			dispatch({
				payload: data,
				type: constants.UPLOAD_VIDEO
			})
		})
		.catch((error) => {
			callback()
			toast.error(error.response.data.msg)
		})
}
