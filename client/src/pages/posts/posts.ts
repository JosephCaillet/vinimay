import { V1Service } from '../../providers/apiClient/api/v1.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, Platform, LoadingController } from 'ionic-angular';
import { PostsArray, Post, User } from "../../providers/apiClient/index";
import { PostModal } from "../../components/post-modal/post-modal";
import { TranslateService } from "@ngx-translate/core";
import { PostComponent } from "../../components/post-component/post-component";

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
		public api: V1Service, public modCtrl: ModalController,
		private alertCtrl: AlertController, private tr: TranslateService,
		public plt: Platform, private loadingCtrl: LoadingController
	) {
		this.retrievePost()
		this.user = this.navParams.data
	}

	retrievePost(done: Function = () => {}) {
		let loading = this.loadingCtrl.create(
			{ "content": this.tr.instant('p.loading') }
		)
		loading.present();

		this.api.getV1ClientPosts().subscribe((data) => {
			this.posts = data.posts
			loading.dismiss()
			done()
		}, (err) => {
			//500 yolo
			console.error(err)
			loading.dismiss()
			done()
		})
	}

	refreshPost(refresher) {
		this.retrievePost(() => refresher.complete())
	}

	createPost() {
		let modal = this.modCtrl.create(PostModal, null)
		modal.onDidDismiss((post) => {
			if (post) {
				this.posts.unshift(post)
			}
		})
		modal.present()
	}

	deletePost(deletedPost: Post, postComponent: PostComponent) {
		let alert = this.alertCtrl.create({
			title: this.tr.instant('p.modal.delete.title'),
			message: this.tr.instant('p.modal.delete.message'),
			buttons: [
				{
					text: this.tr.instant('global.yes'),
					handler: () => {
						this.api.deleteV1ClientPostsTimestamp(deletedPost.creationTs).subscribe(() => {
							postComponent.deleted = true
							setTimeout(() => {
								this.posts = this.posts.filter((post) => {
									return post.creationTs != deletedPost.creationTs
								})
							}, 1100)
						}, (err) => {
							//500 yolo
							//404 post inexistant
							console.error(err)
						})
					}
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