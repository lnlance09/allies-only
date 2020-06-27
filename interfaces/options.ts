import { Department } from "./department"
import { Interaction } from "./interaction"
import { Officer } from "./officer"
import { User } from "./user"

export interface DropdownOptionsPayload {
	departmentId?: number;
	forAutocomplete: number;
	forOptions: number;
	id: string;
	q: string;
}

export interface GetItemPayload {
	callback: void;
	id: number | string;
}

export interface PaginationPayload {
	departmentId?: number;
	exclude: number[];
	officerId?: number;
	page: number;
	q?: string;
	userId?: number;
}

export interface DropdownOption {
	key: string;
	text: string;
	value: number;
}

export interface Results {
	error: boolean;
	errorMsg: string;
	hasMore: boolean;
	loading: boolean;
	page?: number;
}

export interface ToastOption {
	autoClose: number;
	closeOnClick: boolean;
	draggable: boolean;
	hideProgressBar: boolean;
	newestOnTop: boolean;
	position: string;
}

export type ItemTypes = Department | Interaction | Officer | User

export type ItemArrayTypes = Department[] | Interaction[] | Officer[] | User[]

export interface IndividualItemPage extends Results {
	data: ItemTypes;
}

export interface MultipleItemsPage extends Results {
	results: ItemArrayTypes;
}

export interface InitialPageState {
	department?: IndividualItemPage;
	departments?: MultipleItemsPage;
	interaction?: IndividualItemPage;
	interactions?: MultipleItemsPage;
	officer?: IndividualItemPage;
	officers?: MultipleItemsPage;
	user?: IndividualItemPage;
	users?: MultipleItemsPage;
}
