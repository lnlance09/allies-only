export interface Comment {
	createdAt: string;
	interactionId: number;
	message: string;
	responseTo: number;
	updatedAt: string;
	userImg: string | boolean;
	userName: string;
	userUsername: string;
}
