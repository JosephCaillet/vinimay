import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import User from '../model/user';

/*
  Generated class for the UserDAO provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UserDAO {

	private user: User = undefined

  constructor(public http: Http) {
		//this.refresh()
  }

	public get(): Promise<User> {
		return new Promise((ok, ko) => {
			if(this.user) {
				ok(this.user)
			}
			else {
				this.refresh()
					.then((user: User) => ok(user))
					.catch((err) => ko(err))
			}
		})
	}

	public refresh(): Promise<User> {
		return new Promise((ok, ko) => {
			this.user = new User('Toto', 'toto.fr', 'My name is Toto, and my life is a potato.')
			ok(this.user)
		})
	}

	public update(user: User): Promise<User> {
		return new Promise((ok, ko) => {
			ko('Not implemented')
		})
	}
}
