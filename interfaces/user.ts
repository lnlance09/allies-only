import {
	CHANGE_PROFILE_PIC,
	GET_USER,
	SEARCH_USERS,
	SET_USER_FETCH_ERROR,
	SET_USER_INTERACTIONS_FETCH_ERROR,
	UPDATE_USER
} from "@redux/constants"
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
interface GetUserAction {
	payload: {
		department: Department,
		error: boolean,
		msg: string
	};
	type: typeof GET_USER;
}

interface SearchUsersAction {
	payload: {
		departments: Department[],
		error: boolean,
		hasMore: boolean,
		msg: string,
		page: number
	};
	type: typeof SEARCH_USERS;
}

export type UserActionTypes = GetUserAction | SearchUsersAction
