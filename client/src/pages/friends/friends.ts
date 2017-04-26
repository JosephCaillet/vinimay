import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AddProfileModal } from '../../components/add-profile-modal/add-profile-modal';
import { V1Service } from '../../providers/apiClient/api/v1.service';
import { FriendSent, Friends } from "../../providers/apiClient/index";

/**
 * Generated class for the Friends page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-friends',
  templateUrl: 'friends.html',
})
export class FriendsPage {

	StatusEnum = FriendSent.StatusEnum
	friends: Friends = {
		"sent": [
			{"user": "toto@url.com", "status": FriendSent.StatusEnum.Pending},
			{"user": "tata@url.com", "status": FriendSent.StatusEnum.Refused},
			{"user": "titio@url.com", "status": FriendSent.StatusEnum.Pending},
		],
		"received": [
			{"user": "toto@url.com", "description": "Hello i would like to be your friend"},
			{"user": "tata@url.com", "description": "Hello i would like to be your friend"},
		],
		"accepted": [
			{"user": "toto@url.com", "description": "Hello, you already are my friend."},
			{"user": "tata@url.com", "description": "Hello, you already are my friend."},
			{"user": "titio@url.com", "description": "Hello, you already are my friend."},
		]
	}

  constructor(public navCtrl: NavController, public navParams: NavParams, public modCtrl: ModalController, public api: V1Service) {
  	api.getV1ClientFriends().subscribe( (data) => {
			console.log(data)
		}, (err) => {
			console.error(err)
		})
	}

  ionViewDidLoad() {
    console.log('ionViewDidLoad Friends');
  }

	addProfile() {
		let itGo = this.modCtrl.create(AddProfileModal, null, {showBackdrop: false, enableBackdropDismiss: false})
		itGo.present()
	}
}
