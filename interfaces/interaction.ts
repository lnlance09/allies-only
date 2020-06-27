import {
	GET_INTERACTION,
	SET_INTERACTION_FETCH_ERROR,
	RESET_INTERACTION_TO_INITIAL,
	SEARCH_INTERACTIONS,
	SET_INTERACTION_CREATE_ERROR,
	SET_INTERACTION_FETCH_ERROR,
	SET_VIDEO,
	UPLOAD_VIDEO,
	UPDATE_INTERACTION
} from "@redux/constants"
import { Officer } from "./officer"
import { Department } from "./department"
import { User } from "./user"

export interface Interaction {
	createdAt: string;
	department?: Department;
	description: string;
	id: number;
	officers?: Officer[];
	thumbnail: string;
	title: string;
	user?: User;
	video: string;
	views?: number;
}

/* Actions */
export interface CreateInteractionPayload {
	bearer: string;
	callback: void;
	department: number;
	description: string;
	file?: string;
	id?: number;
	officer: number[];
	thumbnail?: string;
	title?: string;
}

export interface SetVideoPayload {
	thumbnail: string;
	video: string;
}

/* Reducers */
interface GetInteractionAction {
	payload: {
		error: boolean,
		msg: string,
		interaction: Interaction
	};
	type: typeof GET_INTERACTION;
}

interface ResetInteractionAction {
	type: typeof RESET_INTERACTION_TO_INITIAL;
}

interface SearchInteractionsAction {
	payload: {
		error: boolean,
		hasMore: boolean,
		msg: string,
		interactions: Interaction[],
		page: number
	};
	type: typeof SEARCH_INTERACTIONS;
}

interface SetVideoAction {
	payload: SetVideoPayload;
	type: typeof SET_VIDEO;
}

export type InteractionActionTypes =
	| CreateInteractionAction
	| GetInteractionAction
	| ResetInteractionAction
	| SearchInteractionsAction
	| SetVideoAction
	| UpdateInteractionAction
