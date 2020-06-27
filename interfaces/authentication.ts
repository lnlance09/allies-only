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

/* Actions */
export interface ChangePasswordPayload {
	bearer: string;
	confirmPassword: string;
	newPassword: string;
	password: string;
}

export interface LoginPayload {
	email: string;
	password: string;
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
interface ChangePasswordAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof CHANGE_PASSWORD;
}

interface LogoutAction {
	type: typeof LOGOUT;
}

interface ResetPasswordAction {
	type: typeof RESET_PASSWORD;
}

interface LoginErrorAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_LOGIN_ERROR;
}

interface RegistrationErrorAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_REGISTER_ERROR;
}

interface SetUserDataAction {
	payload: {
		token: string,
		user: User
	};
	type: typeof SET_USER_DATA;
}

interface VerificationErrorAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_VERIFICATION_ERROR;
}

interface VerifyEmailAction {
	payload: {
		error: boolean,
		msg: string,
		user: User
	};
	type: typeof VERIFY_EMAIL;
}
