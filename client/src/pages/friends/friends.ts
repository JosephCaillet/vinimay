import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, LoadingController } from 'ionic-angular';
import { AddProfileModal } from '../../components/add-profile-modal/add-profile-modal';
import { V1Service } from '../../providers/apiClient/api/v1.service';
import { FriendSent, Friends, Friend, FriendInput } from "../../providers/apiClient/index";
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
		public alertCtrl: AlertController, public tr: TranslateService,
		private loadingCtrl: LoadingController
	) {
		this.refreshFriend()
	}

	refreshFriend(done: Function = () => { }) {
		let loading = this.loadingCtrl.create(
			{ "content": this.tr.instant('f.loading') }
		)
		loading.present();

		this.api.getV1ClientFriends().subscribe((data) => {
			this.friends = data
			loading.dismiss()
			done()
		}, (err) => {
			//500 yolo
			console.error(err)
			loading.dismiss()
			done()
		})
	}

	ionViewDidLoad() {
	}

	addProfile() {
		let itGo = this.modCtrl.create(AddProfileModal, null)
		itGo.onDidDismiss((friendRequest: FriendInput, friend: Friend) => {
			if (friendRequest) {
				if (friendRequest.type == FriendInput.TypeEnum.Following) {
					this.friends.following.push(friend)
				} else {
					let friendSent: FriendSent = { "user": friend.user, "status": FriendSent.StatusEnum.Pending }

					this.friends.sent = this.friends.sent.filter(friendSentInArray => { return friendSentInArray.user != friendSent.user })

					this.friends.sent.push(friendSent)
					this.friends.following = this.friends.following.filter(friendInArray => { return friendInArray.user != friendSent.user })
				}
			}
		})
		itGo.present()
	}

	cancelSentRequest(friend: FriendSent) {
		let alert = this.alertCtrl.create({
			title: this.tr.instant('f.sent.modal.cancel_title'),
			message: this.tr.instant('f.sent.modal.cancel_message', { user: friend.user }),
			buttons: [
				{
					text: this.tr.instant('global.no'),
					role: 'cancel'
				},
				{
					text: this.tr.instant('global.yes'),
					handler: () => {
						this.api.putV1ClientFriendsUser(friend.user, { "accepted": false }).subscribe(() => {
							this.friends.sent = this.friends.sent.filter(f => {
								return f.user != friend.user
							})
						}, err => {
							console.error(err)
						})
					}
				}
			]
		})
		alert.present()
	}

	hideRejectedSentRequest(friend: FriendSent) {
		this.api.deleteV1ClientFriendsUser(friend.user).subscribe(() => {
			this.friends.sent = this.friends.sent.filter(f => {
				return f.user != friend.user
			})
		}, err => {
			console.error(err)
		})
	}

	removeFollowing(friend: FriendSent) {//todo: confirmation modal
		this.api.deleteV1ClientFriendsUser(friend.user).subscribe(() => {
			this.friends.following = this.friends.following.filter(f => {
				return f.user != friend.user
			})
		}, err => {
			console.error(err)
		})
	}

	showFriendDetails(friend: Friend) {
		let alert = this.alertCtrl.create({
			subTitle: `${friend.user}`,
			message: `${friend.description}`,
			buttons: [this.tr.instant('global.close')]
		})
		alert.present()
	}

	acceptFriendRequest(friend: Friend) {
		this.api.putV1ClientFriendsUser(friend.user, { "accepted": true }).subscribe(() => {
			this.friends.incoming = this.friends.incoming.filter(f => {
				return f.user != friend.user
			})
			this.friends.accepted.push({ "user": friend.user, "description": friend.description })
		}, err => {
			console.error(err)
		})
	}

	declineFriendRequest(friend: Friend) {
		let alert = this.alertCtrl.create({
			title: this.tr.instant('f.received.modal.decline_title'),
			message: this.tr.instant('f.received.modal.decline_message', { user: friend.user }),
			buttons: [
				{
					text: this.tr.instant('global.no'),
					role: 'cancel'
				},
				{
					text: this.tr.instant('global.yes'),
					handler: () => {
						this.api.putV1ClientFriendsUser(friend.user, { "accepted": false }).subscribe(() => {
							this.friends.incoming = this.friends.incoming.filter(f => {
								return f.user != friend.user
							})
						}, err => {
							console.error(err)
						})
					}
				}
			]
		})
		alert.present()
	}

	removeFriend(friend: Friend) {
		let alert = this.alertCtrl.create({
			title: this.tr.instant('f.friend.modal.remove_title'),
			message: this.tr.instant('f.friend.modal.remove_message', { user: friend.user }),
			buttons: [
				{
					text: this.tr.instant('global.no'),
					role: 'cancel'
				},
				{
					text: this.tr.instant('global.yes'),
					handler: () => {
						this.api.putV1ClientFriendsUser(friend.user, { "accepted": false }).subscribe(() => {
							this.friends.accepted = this.friends.accepted.filter(f => {
								return f.user != friend.user
							})
						}, err => {
							console.error(err)
						})
					}
				}
			]
		})
		alert.present()
	}
}