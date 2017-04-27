import { V1Service } from '../../providers/apiClient/api/v1.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { PostsArray, Post } from "../../providers/apiClient/index";
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

	posts: PostsArray = [
		{
			"author": "titi@toto.fr",
			"creationTs": 5,
			"lastEditTs": 6,
			"privacy": Post.PrivacyEnum.Public,
			"content": "Oh un cyclamen!",
			"comments": 0,
			"reactions": 0
		},
		{
			"author": "tutu@tdvrrfoto.fr",
			"creationTs": 8,
			"lastEditTs": 8,
			"privacy": Post.PrivacyEnum.Private,
			"content": "This is a secret... 300 rupies... pala pa paa !",
			"comments": 5,
			"reactions": 0
		},
		{
			"author": "tigrgrgrgegti@toto.fr",
			"creationTs": 8000,
			"lastEditTs": 9000,
			"privacy": Post.PrivacyEnum.Friends,
			"content": "Oh un cyclamen!",
			"comments": 0,
			"reactions": 9
		}
	]

  constructor(
		public navCtrl: NavController, public navParams: NavParams,
		public api: V1Service, public modCtrl: ModalController
	) {
		api.getV1ClientPosts().subscribe((data) => {
			console.log(data)
		}, (err) => {
			console.error(err)
		})
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Posts');
  }

	createPost() {
		let modal = this.modCtrl.create(PostModal, null, { showBackdrop: false, enableBackdropDismiss: false })
		modal.present()
	}

}