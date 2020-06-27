import {
	GET_DEPARTMENT,
	SET_DEPARTMENT_FETCH_ERROR,
	RESET_DEPARTMENT_TO_INITIAL,
	SEARCH_DEPARTMENTS,
	SET_DEPARTMENT_CREATE_ERROR,
	SET_DEPARTMENT_FETCH_ERROR,
	UPDATE_DEPARTMENT
} from "@redux/constants"
import { Interaction } from "./interaction"
import { Officer } from "./officer"

export interface Department {
	city: string;
	county: string;
	id?: number;
	interactionCount?: number;
	interactions?: Interaction[];
	lat: string;
	lon: string;
	name: string;
	officerCount?: number;
	officers?: Officer[];
	state: string;
	type: number;
}

/* Actions */
export interface CreateDepartmentPayload {
	bearer: string;
	callback: void;
	department: number;
	firstName: string;
	lastName: string;
}

export interface UpdateDepartmentPayload {
	bearer: string;
	callback: void;
	data: string;
	id: number;
}

/* Reducers */
interface CreateDepartmentAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_DEPARTMENT_CREATE_ERROR;
}

interface GetDepartmentAction {
	payload: {
		department: Department,
		error: boolean,
		msg: string
	};
	type: typeof GET_DEPARTMENT;
}

interface ResetDepartmentAction {
	type: typeof RESET_DEPARTMENT_TO_INITIAL;
}

interface SearchDepartmentsAction {
	payload: {
		departments: Department[],
		error: boolean,
		hasMore: boolean,
		msg: string,
		page: number
	};
	type: typeof SEARCH_DEPARTMENTS;
}

interface SetDepartmentErrorAction {
	payload: {
		error: boolean,
		msg: string
	};
	type: typeof SET_DEPARTMENT_FETCH_ERROR;
}

interface UpdateDepartmentAction {
	payload: {
		department: Department,
		error: boolean,
		msg: string
	};
	type: typeof UPDATE_DEPARTMENT;
}

export type DepartmentActionTypes =
	| CreateDepartmentAction
	| GetDepartmentAction
	| ResetDepartmentAction
	| SearchDepartmentsAction
	| SetDepartmentErrorAction
	| UpdateDepartmentAction
