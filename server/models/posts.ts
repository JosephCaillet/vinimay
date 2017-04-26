export class Post {
	creationTs: number;
	lastModificationTs: number;
	author?: string;
	content: string;
	privacy: string;
	comments: number;
	reactions: number;
}

export enum Privacy {
	private,
	friends,
	public
}