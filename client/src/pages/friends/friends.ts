import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { AddProfileModal } from '../../components/add-profile-modal/add-profile-modal';
import { V1Service } from '../../providers/apiClient/api/v1.service';
import { FriendSent, Friends, Friend } from "../../providers/apiClient/index";
import { TranslateService } from "@ngx-translate/core";
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
		"sent": [],
		"incoming": [],
		"accepted": [],
		"following": []
	}

	constructor(
		public navCtrl: NavController, public navParams: NavParams,
		public modCtrl: ModalController, public api: V1Service,
		public alertCtrl: AlertController, public tr: TranslateService
	) {
		api.getV1ClientFriends().subscribe((data) => {
			this.friends = data
			console.log(data)
		}, (err) => {
			console.error(err)
		})
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad Friends');
	}

	addProfile() {
		let itGo = this.modCtrl.create(AddProfileModal, null, { showBackdrop: false, enableBackdropDismiss: false })
		itGo.present()
	}

	cancelSentRequest(friend: FriendSent) {
		let alert = this.alertCtrl.create({
			title: this.tr.instant('f.sent.modal.cancel_title'),
			message: this.tr.instant('f.sent.modal.cancel_message', {user: friend.user}),
			buttons: [
				{
					text: this.tr.instant('global.yes'),
					role: 'cancel'
				},
				{
					text: this.tr.instant('global.no'),
					handler: () => {}
				}
			]
		})
		alert.present()
	}

	hideRejectedSentRequest(friend: FriendSent) {
	}

	showFriendDetails(friend: Friend) {
		let alert = this.alertCtrl.create({
			title: `${friend.user}`,
			message: `${friend.description}`,
			buttons: [this.tr.instant('global.ok')]
		})
		alert.present()
	}

	acceptFriendRequest(friend: Friend) {
	}

	declineFriendRequest(friend: Friend) {
		let alert = this.alertCtrl.create({
			title: this.tr.instant('f.received.modal.decline_title'),
			message: this.tr.instant('f.received.modal.decline_message', {user: friend.user}),
			buttons: [
				{
					text: this.tr.instant('global.yes'),
					handler: () => {}
				},
				{
					text: this.tr.instant('global.no'),
					role: 'cancel'
				}
			]
		})
		alert.present()
	}

	removeFriend(friend: Friend) {
		let alert = this.alertCtrl.create({
			title: this.tr.instant('f.friend.modal.remove_title'),
			message: this.tr.instant('f.friend.modal.remove_message', {user: friend.user}),
			buttons: [
				{
					text: this.tr.instant('global.yes'),
					handler: () => {}
				},
				{
					text: this.tr.instant('global.no'),
					role: 'cancel'
				}
			]
		})
		alert.present()
	}
}