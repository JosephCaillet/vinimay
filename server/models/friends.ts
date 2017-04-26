export class Friend {
	private _user: string;
	private _description?: string;

	public constructor(user: string, description?: string) {
		this._user = user;
		if(description) this._description = description;
	}
	
	public get user(): string {
		return this._user;
	}

	public get description(): string | undefined {
		return this._description;
	}
}

export enum Status {
	pending,
	declined,
	incoming,
	accepted,
	following
}

export interface OutgoingRequests {
	user: string,
	status: Status
}