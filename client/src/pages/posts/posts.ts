import { V1Service } from '../../providers/apiClient/api/v1.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { PostsArray, Post, User } from "../../providers/apiClient/index";
import { PostModal } from "../../components/post-modal/post-modal";

/**
 * Generated class for the Posts page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
	selector: 'page-posts',
	templateUrl: 'posts.html',
})
export class PostsPage {

	user: User
	posts: PostsArray

	constructor(
		public navCtrl: NavController, public navParams: NavParams,
		public api: V1Service, public modCtrl: ModalController
	) {
		api.getV1ClientPosts().subscribe((data) => {
			this.posts = data.posts
		}, (err) => {
			console.error(err)
		})
		this.user = navParams.data
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad Posts');
	}

	createPost() {
		let modal = this.modCtrl.create(PostModal, null, { showBackdrop: false, enableBackdropDismiss: false })
		modal.onDidDismiss((post) => {
			if (post) {
				this.posts.splice(0, 0, post)
			}
		})
		modal.present()
	}

}