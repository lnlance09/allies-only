import * as constants from "../constants"
import { setToken } from "@utils/tokenFunctions"
import { toast } from "react-toastify"
import axios from "axios"
import Router from "next/router"

toast.configure({
	autoClose: 2000,
	closeOnClick: true,
	draggable: true,
	hideProgressBar: true,
	newestOnTop: true
})

export const changePassword = ({ bearer, confirmPassword, newPassword, password }) => (
	dispatch
) => {
	axios
		.post("/api/user/changePassword", {
			confirmPassword,
			password,
			newPassword
		})
		.then((response) => {
			dispatch({
				payload: response,
				type: constants.CHANGE_PASSWORD
			})
		})
		.catch((error) => {
			console.log(error)
		})
}

export const logout = () => async (dispatch) => {
	dispatch({
		type: constants.LOGOUT
	})
}

export const resetPasswordProps = () => (dispatch) => {
	dispatch({
		type: constants.RESET_PASSWORD_PROPS
	})
}

export const submitLoginForm = ({ email, password }) => (dispatch) => {
	axios
		.post("/api/user/login", {
			email,
			password
		})
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.SET_USER_DATA
			})

			await setToken(data.user)
			if (data.user.emailVerified) {
				Router.push("/")
			}
		})
		.catch((error) => {
			toast.error(error.response.data.msg)

			dispatch({
				payload: error.response.data,
				type: constants.SET_LOGIN_ERROR
			})
		})
}

export const submitRegistrationForm = ({ email, name, password, status, username }) => (
	dispatch
) => {
	axios
		.post("/api/user/create", {
			email,
			name,
			password,
			status,
			username
		})
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.SET_USER_DATA
			})

			await setToken(data.user)
		})
		.catch((error) => {
			toast.error(error.response.data.msg)

			dispatch({
				payload: error.response.data,
				type: constants.SET_REGISTER_ERROR
			})
		})
}

export const submitVerificationForm = ({ code, bearer }) => (dispatch) => {
	axios
		.post(
			"/api/user/verify",
			{
				code
			},
			{
				headers: {
					Authorization: bearer
				}
			}
		)
		.then(async (response) => {
			const { data } = response
			dispatch({
				payload: data,
				type: constants.VERIFY_EMAIL
			})

			await setToken(data.user)
			if (!data.error) {
				Router.push("/")
			}
		})
		.catch((error) => {
			toast.error(error.response.data.msg)

			dispatch({
				payload: error.response.data,
				type: constants.SET_VERIFICATION_ERROR
			})
		})
}
