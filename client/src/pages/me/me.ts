import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserDAO } from '../../providers/user-dao';

import User from "../../model/user";

/**
 * Generated class for the Me page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-me',
  templateUrl: 'me.html',
})
export class MePage {

	public user = new User('','','')

  constructor(public navCtrl: NavController, public navParams: NavParams, private userDAO: UserDAO) {
		console.log("recup user data");
		userDAO.get().then((user: User) => {
			this.user = user
		})
  }

}