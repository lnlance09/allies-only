import {
	CHANGE_PROFILE_PIC,
	GET_USER,
	GET_USER_COMMENTS,
	SEARCH_USERS,
	SET_USER_FETCH_ERROR
} from "@redux/constants"
import { Interaction, SearchInteractionsAction } from "./interaction"
import { Comment } from "./comment"

export interface User {
	createdAt?: string;
	id: number;
	img: string;
	interactionCount?: number;
	interactions?: Interaction[];
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

export interface GetUserCommentsPayload {
	page: number;
	userId: number;
}

/* Reducers */
export interface GetUserAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof GET_USER;
}

export interface GetUserCommentsAction {
	payload: {
		comments: Comment[],
		error: boolean,
		hasMore: boolean,
		msg: string,
		page: number
	};
	type: typeof GET_USER_COMMENTS;
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
	| GetUserCommentsAction
	| SearchInteractionsAction
	| SearchUsersAction
	| SetUserErrorAction
