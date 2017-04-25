import { IonicPage, ViewController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import UrlRegExp from '../../utils/urlRegExp';

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
	relationType = 'friend'
	addProfileForm: FormGroup
	urlRegex: RegExp

	constructor(private viewCtrl: ViewController) {
		this.addProfileForm = new FormGroup({
			"url": new FormControl('', Validators.compose([Validators.pattern(UrlRegExp), Validators.required])),
			"type": new FormControl(this.relationType, Validators.required)
		})
	}

	initUrlRegex

	ionViewDidLoad() {
		this.urlInput.setFocus()
	}

	dismiss(cancel: boolean) {
		if (cancel) {
			this.viewCtrl.dismiss(false);
		} else {
			this.viewCtrl.dismiss({ "url": this.url, "rel": this.relationType })
		}
	}
}
