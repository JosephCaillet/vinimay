export class Friend {
	public constructor(public user: string, public description?: string) {}
}

export class OutgoingRequests {
	public constructor(public user: string, public status: string) {}
}

export class Response {
    private accepted: Friend[] = new Array<Friend>();
	private received: Friend[] = new Array<Friend>();
	private sent: OutgoingRequests[] = new Array<OutgoingRequests>();
	private following: Friend[] = new Array<Friend>();

	public addAccepted(friend: Friend): void {
		this.accepted.push(friend);
	}

	public addReceived(friend: Friend): void {
		this.received.push(friend);
	}

	public addSent(friend: OutgoingRequests): void {
		this.sent.push(friend);
	}

	public addFollowing(friend: Friend): void {
		this.following.push(friend);
	}
}

export enum Status {
	pending,
	declined,
	incoming,
	accepted,
	following
}
