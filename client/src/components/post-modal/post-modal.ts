import { Component, ViewChild } from '@angular/core';
import { PostInput, V1Service } from "../../providers/apiClient/index";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ViewController, LoadingController } from "ionic-angular";
import { TranslateService } from "@ngx-translate/core";

/**
 * Generated class for the PostModal component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
	selector: 'post-modal',
	templateUrl: 'post-modal.html'
})
export class PostModal {

	@ViewChild('contentInput') contentInput
	PrivacyEnum = PostInput.PrivacyEnum
	privacyLevels: Array<{ value: PostInput.PrivacyEnum, text: string }>
	postForm: FormGroup

	constructor(
		private viewCtrl: ViewController, public tr: TranslateService,
		private api: V1Service, private loadingCtrl: LoadingController)
	{
		this.postForm = new FormGroup({
			"privacy": new FormControl(PostInput.PrivacyEnum[PostInput.PrivacyEnum.Friends].toLowerCase(), Validators.required),
			"content": new FormControl('', Validators.required)
		})
		this.privacyLevels = [
			{ "value": PostInput.PrivacyEnum.Public, "text": tr.instant('p.privacy.public') },
			{ "value": PostInput.PrivacyEnum.Friends, "text": tr.instant('p.privacy.friends') },
			{ "value": PostInput.PrivacyEnum.Private, "text": tr.instant('p.privacy.me') }
		]
	}

	ionViewDidLoad() {
		this.contentInput.setFocus()
	}

	dismiss(postPosted: boolean) {
		if (postPosted) {
			let loading = this.loadingCtrl.create()
			loading.present();

			this.api.postV1ClientPosts(this.postForm.value).subscribe((post) => {
				loading.dismiss()
				this.viewCtrl.dismiss(post)
			}, (err) => {
				loading.dismiss()
				//500 yolo
				console.error(err)
			})
		} else {
			this.viewCtrl.dismiss(null);
		}
	}
}