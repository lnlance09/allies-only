import * as constants from "../constants"
import {
	ChangeProfilePicAction,
	ChangeProfilePicPayload,
	GetUserAction,
	GetUserCommentsAction,
	GetUserCommentsPayload,
	GetUserPayload,
	SetUserErrorAction
} from "@interfaces/user"
import { PaginationPayload } from "@interfaces/options"
import { AppDispatch } from "@store/index"
import axios from "axios"

export const changeProfilePic = ({
	bearer,
	file
}: ChangeProfilePicPayload): ChangeProfilePicAction => (dispatch: AppDispatch) => {
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

export const getUser = ({
	callback = () => null,
	username
}: GetUserPayload): GetUserAction | SetUserErrorAction => (dispatch: AppDispatch) => {
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

export const getUserComments = ({
	page,
	userId
}: GetUserCommentsPayload): GetUserCommentsAction => (dispatch: AppDispatch) => {
	axios
		.get("/api/comment/search", {
			params: {
				page,
				userId
			}
		})
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.GET_USER_COMMENTS
			})
		})
		.catch(() => null)
}

export const searchUsers = ({ page = 0, q = "" }: PaginationPayload): void => (
	dispatch: AppDispatch
) => {
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
