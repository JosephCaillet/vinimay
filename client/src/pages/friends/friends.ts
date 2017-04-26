import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AddProfileModal } from '../../components/add-profile-modal/add-profile-modal';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public modCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Friends');
  }

	addProfile() {
		let itGo = this.modCtrl.create(AddProfileModal, null, {showBackdrop: false, enableBackdropDismiss: false})
		itGo.present()
	}
}
