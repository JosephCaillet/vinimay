import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { User, V1Service } from "../../providers/apiClient/index";

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {

	user: User = {username: '', url : '', description: ''}

	constructor(public navCtrl: NavController, private api: V1Service) {
		api.getV1ClientMe().subscribe((user) => {
			Object.assign(this.user, user)
		}, (err) => {
			this.user = {username: '', url : '', description: ''}
		})
	}

}