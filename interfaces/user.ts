import { CHANGE_PROFILE_PIC, GET_USER, SEARCH_USERS, SET_USER_FETCH_ERROR } from "@redux/constants"
import { Results } from "./results"
import { Interaction } from "./interaction"

interface Interactions extends Results {
	results: Interaction[];
}

export interface User {
	createdAt?: string;
	id: number;
	img: string;
	interactionCount?: number;
	interactions?: Interactions[];
	name: string;
	status?: number;
	username: string;
}

/* Actions */
export interface ChangeProfilePicPayload {
	bearer: string;
	file: string;
}

export interface GetUserPayload {
	callback: void;
	username: string;
}

/* Reducers */
export interface GetUserAction {
	payload: {
		department: Department,
		error: boolean,
		msg: string
	};
	type: typeof GET_USER;
}

export interface ChangeProfilePicAction {
	payload: {
		error: boolean,
		img?: string,
		msg: string
	};
	type: typeof CHANGE_PROFILE_PIC;
}

export interface SearchUsersAction {
	payload: {
		error: boolean,
		hasMore: boolean,
		msg: string,
		page: number,
		users: User[]
	};
	type: typeof SEARCH_USERS;
}

export interface SetUserErrorAction {
	type: typeof SET_USER_FETCH_ERROR;
}

export type UserActionTypes =
	| ChangeProfilePicAction
	| GetUserAction
	| SearchUsersAction
	| SetUserErrorAction
