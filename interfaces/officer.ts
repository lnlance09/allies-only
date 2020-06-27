import {
	GET_OFFICER,
	RESET_OFFICER_TO_INITIAL,
	SEARCH_OFFICERS,
	SET_OFFICER_CREATE_ERROR,
	SET_OFFICER_FETCH_ERROR,
	UPDATE_OFFICER_IMG
} from "@redux/constants"

export interface Officer {
	createdAt: string;
	departmentId: number;
	departmentName: string;
	departmentSlug: string;
	firstName: string;
	id: number;
	img: string;
	interactionCount: number;
	lastName: string;
	position: string;
}

/* Actions */
export interface createOfficerPayload {
	bearer: string;
	callback: void;
	department: number;
	firstName: string;
	lastName: string;
}

export interface updateImgPayload {
	bearer: string;
	file: string;
	id: number;
}

export interface updateOfficerPayload {
	bearer: string;
	callback: void;
	data: string;
	id: number;
}

/* Reducers */
interface CreateOfficerAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_OFFICER_CREATE_ERROR;
}

interface GetOfficerAction {
	payload: {
		error: boolean,
		msg: string,
		officer: Officer
	};
	type: typeof GET_OFFICER;
}

interface ResetOfficerAction {
	type: typeof RESET_OFFICER_TO_INITIAL;
}

interface SearchOfficersAction {
	payload: {
		error: boolean,
		hasMore: boolean,
		msg: string,
		officers: Officer[],
		page: number
	};
	type: typeof SEARCH_OFFICERS;
}

interface SetOfficerErrorAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_OFFICER_FETCH_ERROR;
}

interface UpdateOfficerImgAction {
	payload: {
		error: boolean,
		img: string,
		msg: string
	};
	type: typeof UPDATE_OFFICER_IMG;
}

export type OfficerActionTypes =
	| CreateOfficerAction
	| GetOfficerAction
	| ResetOfficerAction
	| SearchOfficersAction
	| SetOfficerErrorAction
	| UpdateOfficerImgAction
