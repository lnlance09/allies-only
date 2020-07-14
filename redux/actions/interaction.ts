import * as constants from "../constants"
import { toast } from "react-toastify"
import { getConfig } from "@options/toast"
import {
	CreateInteractionPayload,
	GetCommentsAction,
	GetCommentsPayload,
	GetInteractionAction,
	LikeCommentAction,
	LikeCommentPayload,
	ResetInteractionAction,
	SearchInteractionsAction,
	SetVideoAction,
	SetVideoPayload,
	UnlikeCommentAction,
	UnlikeCommentPayload,
	UploadVideoAction,
	UploadVideoPayload
} from "@interfaces/interaction"
import { GetItemPayload, PaginationPayload } from "@interfaces/options"
import { AppDispatch } from "@store/index"
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

export const getComments = ({
	bearer,
	commentId,
	interactionId,
	page,
	replyId
}: GetCommentsPayload): GetCommentsAction => (dispatch: AppDispatch) => {
	axios
		.get("/api/comment/search", {
			params: {
				commentId,
				interactionId,
				page,
				replyId
			},
			headers: {
				Authorization: bearer
			}
		})
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_COMMENTS
			})
		})
		.catch(() => {
			dispatch({
				type: constants.SET_COMMENTS_FETCH_ERROR
			})
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

export const likeComment = ({
	bearer,
	commentId,
	responseId
}: LikeCommentPayload): LikeCommentAction => (dispatch: AppDispatch) => {
	axios
		.post(
			"/api/comment/like",
			{
				commentId,
				responseId
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
				dispatch({
					payload: {
						commentId,
						responseId
					},
					type: constants.LIKE_COMMENT
				})
			}
		})
		.catch(() => null)
}

export const postComment = ({
	bearer,
	callback = () => null,
	interactionId,
	message,
	responseTo
}: PostCommentPayload): PostCommentAction => (dispatch: AppDispatch) => {
	axios
		.post(
			"/api/comment/create",
			{
				interactionId,
				message,
				responseTo
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
				callback()
				toast.success("Comment added!")

				data.responseTo = responseTo

				dispatch({
					payload: data,
					type: constants.POST_COMMENT
				})
			}
		})
		.catch((error) => {
			toast.error(error.response.data.msg)
			dispatch({
				type: constants.POST_COMMENT_ERROR
			})
		})
}

export const resetToInitial = (): ResetInteractionAction => (dispatch: AppDispatch) => {
	dispatch({
		type: constants.RESET_INTERACTION_TO_INITIAL
	})
}

export const searchInteractions = ({
	callback = () => null,
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
			callback()
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

export const unlikeComment = ({
	bearer,
	commentId,
	responseId
}: UnlikeCommentPayload): UnlikeCommentAction => (dispatch: AppDispatch) => {
	axios
		.post(
			"/api/comment/unlike",
			{
				commentId,
				responseId
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
				dispatch({
					payload: {
						commentId,
						responseId
					},
					type: constants.UNLIKE_COMMENT
				})
			}
		})
		.catch(() => null)
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
				toast.success("Updated!")
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

export const uploadVideo = ({
	callback = () => null,
	file
}: UploadVideoPayload): UploadVideoAction => (dispatch: AppDispatch) => {
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
