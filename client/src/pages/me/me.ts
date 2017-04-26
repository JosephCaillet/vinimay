import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { V1Service } from '../../providers/apiClient/api/v1.service';
import { User } from '../../providers/apiClient/model/user';

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

	public user: User = {username: '', url : '', description: ''}

  constructor(public navCtrl: NavController, public navParams: NavParams, private api: V1Service) {
		api.getV1ClientMe() .subscribe((data) => {
			this.user = data
		}, (err) => {
			console.error(err)
		})
  }

}