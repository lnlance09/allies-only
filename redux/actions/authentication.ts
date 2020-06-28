import * as constants from "../constants"
import { setToken } from "@utils/tokenFunctions"
import { toast } from "react-toastify"
import { getConfig } from "@options/toast"
import {
	ChangePasswordAction,
	ChangePasswordPayload,
	LoginErrorAction,
	LoginPayload,
	LogoutAction,
	RegistrationErrorAction,
	RegistrationPayload,
	ResetPasswordAction,
	SetUserDataAction,
	VerificationErrorAction,
	VerificationPayload,
	VerifyEmailAction
} from "@interfaces/authentication"
import { AppDispatch } from "@store/index"
import axios from "axios"
import React from "react"
import Router from "next/router"

const toastConfig = getConfig()
toast.configure(toastConfig)

export const changePassword = ({
	bearer,
	confirmPassword,
	newPassword,
	password
}: ChangePasswordPayload): ChangePasswordAction => (dispatch: AppDispatch) => {
	axios
		.post(
			"/api/user/changePassword",
			{
				confirmPassword,
				password,
				newPassword
			},
			{
				headers: {
					Authorization: bearer
				}
			}
		)
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

export const logout = (): LogoutAction => (dispatch: AppDispatch) => {
	dispatch({
		type: constants.LOGOUT
	})
}

export const resetPasswordProps = (): ResetPasswordAction => (dispatch: AppDispatch) => {
	dispatch({
		type: constants.RESET_PASSWORD
	})
}

export const submitLoginForm = ({
	email,
	password
}: LoginPayload): SetUserDataAction | LoginErrorAction => (dispatch) => {
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

export const submitRegistrationForm = ({
	email,
	name,
	password,
	status,
	username
}: RegistrationPayload): SetUserDataAction | RegistrationErrorAction => (dispatch: AppDispatch) => {
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

export const submitVerificationForm = ({
	bearer,
	code
}: VerificationPayload): VerifyEmailAction | VerificationErrorAction => (dispatch: AppDispatch) => {
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
