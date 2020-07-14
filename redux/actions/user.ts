import * as constants from "../constants"
import { toast } from "react-toastify"
import { getConfig } from "@options/toast"
import { parseJwt, setToken } from "@utils/tokenFunctions"
import {
	ChangeProfilePicAction,
	ChangeProfilePicPayload,
	GetUserAction,
	GetUserCommentsAction,
	GetUserCommentsPayload,
	GetUserPayload,
	SetUserErrorAction,
	UpdateUserPayload
} from "@interfaces/user"
import { PaginationPayload } from "@interfaces/options"
import { AppDispatch } from "@store/index"
import axios from "axios"

const toastConfig = getConfig()
toast.configure(toastConfig)

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
			if (!data.error) {
				const userData = parseJwt()
				userData.img = data.img
				if (userData) {
					setToken(userData)
				}
			}

			dispatch({
				payload: data,
				type: constants.CHANGE_PROFILE_PIC
			})
		})
		.catch((error) => {
			toast.error(error.response.data.msg)
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
		.get(`/api/user/${userId}/comments`, {
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

export const updateUser = ({ bearer, bio, callback = () => null }: UpdateUserPayload): void => (
	dispatch: AppDispatch
) => {
	const formData = new FormData()
	formData.set("bio", bio)

	axios
		.post("/api/user/update", formData, {
			headers: {
				Authorization: bearer
			}
		})
		.then((response) => {
			const { data } = response
			if (!data.error) {
				toast.success("Updated")
				callback()
			}

			dispatch({
				payload: data,
				type: constants.UPDATE_USER
			})
		})
		.catch(() => {
			dispatch({
				type: constants.SET_USER_UPDATE_ERROR
			})
		})
}
