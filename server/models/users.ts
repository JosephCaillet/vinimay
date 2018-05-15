export class User {
	private _username: string;
	private _instance: string;

	public constructor(input: string);
	public constructor(username: string, instance: string);

	public constructor(input: string, instance?: string) {
		if(instance) {
			this._username = input;
			this._instance = instance;
		} else {
			let user = input.split('@');
			this._username = user[0];
			this._instance = user[1];
		}
	}

	public toString(): string {
		return this._username + '@' + this._instance;
	}

	public get username() {
		return this._username;
	}

	public get instance() {
		return this._instance;
	}
}