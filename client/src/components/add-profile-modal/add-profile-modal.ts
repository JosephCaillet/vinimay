import { IonicPage, ViewController, LoadingController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { V1Service, FriendInput } from "../../providers/apiClient/index";
/**
 * Generated class for the AddProfileModal component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@IonicPage()
@Component({
	selector: 'add-profile-modal',
	templateUrl: 'add-profile-modal.html'
})
export class AddProfileModal {

	@ViewChild('urlInput') urlInput
	url = '';
	TypeEnum = FriendInput.TypeEnum
	addProfileForm: FormGroup
	relationType = FriendInput.TypeEnum.Friend

	constructor(private viewCtrl: ViewController, private api: V1Service, private loadingCtrl: LoadingController) {
		this.addProfileForm = new FormGroup({
			"to": new FormControl('', Validators.compose([Validators.pattern(/.+@.+/), Validators.required])),
			"type": new FormControl(FriendInput.TypeEnum.Friend, Validators.required)
		})
	}

	ionViewDidLoad() {
		this.urlInput.setFocus()
	}

	dismiss(sendRequest: boolean) {
		if (sendRequest) {
			let loading = this.loadingCtrl.create()
			loading.present();

			let friendRequest: FriendInput = {
				"to": this.addProfileForm.controls['to'].value,
				"type": this.addProfileForm.controls['type'].value
			}

			this.api.postV1ClientFriends(friendRequest).subscribe(friend => {
				this.viewCtrl.dismiss(friendRequest, friend)//todo: display message if add friend and user is followed, and if not in followinf his public post will be followed.
				loading.dismiss()
			}, err => {
				//503 serveur pas joingnable
				//404 user existe pas sur le serveur
				//403 ajout de sois même
				//500 erreur serveur non ident
				loading.dismiss()
				console.error(err)
			})

		} else {
			this.viewCtrl.dismiss(false);
		}
	}
}