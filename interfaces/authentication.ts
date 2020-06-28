import {
	CHANGE_PASSWORD,
	LOGOUT,
	RESET_PASSWORD,
	SET_LOGIN_ERROR,
	SET_REGISTER_ERROR,
	SET_USER_DATA,
	SET_VERIFICATION_ERROR,
	VERIFY_EMAIL
} from "@redux/constants"
import { User } from "./user"

export interface Authentication {
	bearer: string;
	data: User;
	inverted: boolean;
	login: boolean;
	loginError: boolean;
	loginErrorMsg: string;
	registerError: boolean;
	registerErrorMsg: string;
	verify: boolean;
	verifyError: boolean;
	verifyErrorMsg: string;
}

/* Actions */
export interface ChangePasswordPayload {
	bearer: string;
	confirmPassword: string;
	newPassword: string;
	password: string;
}

export class LoginPayload {
	email: string
	password: string
}

export interface RegistrationPayload {
	email: string;
	name: string;
	status: number;
	password: string;
	username: string;
}

export interface VerificationPayload {
	bearer: string;
	code: string;
}

/* Reducers */
export interface ChangePasswordAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof CHANGE_PASSWORD;
}

export interface LogoutAction {
	type: typeof LOGOUT;
}

export interface LoginErrorAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_LOGIN_ERROR;
}

export interface RegistrationErrorAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_REGISTER_ERROR;
}

export interface ResetPasswordAction {
	type: typeof RESET_PASSWORD;
}

export interface SetUserDataAction {
	payload: {
		token: string,
		user: User
	};
	type: typeof SET_USER_DATA;
}

export interface VerificationErrorAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_VERIFICATION_ERROR;
}

export interface VerifyEmailAction {
	payload: {
		error: boolean,
		msg: string,
		user: User
	};
	type: typeof VERIFY_EMAIL;
}

export type AuthenticationActionTypes =
	| ChangePasswordAction
	| LoginErrorAction
	| LogoutAction
	| ResetPasswordAction
	| RegistrationErrorAction
	| SetUserDataAction
	| VerificationErrorAction
	| VerifyEmailAction
