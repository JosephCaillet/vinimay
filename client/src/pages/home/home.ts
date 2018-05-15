import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { User, V1Service } from "../../providers/apiClient/index";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {

	user: User = { username: '', url: '', description: '' }

	constructor(
		public navCtrl: NavController, private api: V1Service,
		private loadingCtrl: LoadingController, private tr: TranslateService)
	{
		let loading = loadingCtrl.create(
			{ "content": tr.instant('h.loading') }
		)
		loading.present();

		api.getV1ClientMe().subscribe((user) => {
			Object.assign(this.user, user)
			loading.dismiss()
		}, (err) => {
			this.user = { username: '', url: '', description: '' }
		})
	}

}