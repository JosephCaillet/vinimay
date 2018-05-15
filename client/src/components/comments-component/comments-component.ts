import { Comment } from '../../providers/apiClient/model/comment';
import { User } from '../../providers/apiClient/model/user';
import { Component, Input, ViewChild } from '@angular/core';
import { Post, CommentsArray, V1Service } from "../../providers/apiClient/index";
import { FormGroup, FormControl } from "@angular/forms";
import { DateFormaterService } from "../../providers/date-formater";

/**
 * Generated class for the CommentsComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
	selector: 'comments-component',
	templateUrl: 'comments-component.html',
})
export class CommentsComponent {

	@ViewChild('commentsList') commentList
	@Input() post: Post
	@Input() user: User
	commentForm: FormGroup
	comments: CommentsArray = []
	deleted = false

	constructor(public dateFormater: DateFormaterService, private api: V1Service) {
		this.commentForm = new FormGroup({ "comment": new FormControl('') })
	}

	ngOnInit() {
		this.api.getV1ClientPostsUserTimestampComments(this.post.author, this.post.creationTs).subscribe((data) => {
			this.comments = data.comments
		}, (err) => {
			//500 yolo
			//404 post inexistant ou user inexistant
			//503 serveur non joignable
			console.error(err)
		})
	}

	createComment() {
		this.api.postV1ClientPostsUserTimestampComments(this.post.author, this.post.creationTs, { "content": this.commentForm.value.comment })
			.subscribe((data) => {
				this.commentForm.controls['comment'].setValue('')
				this.post.comments++
				this.comments.push(data)
			}, (err) => {
				//500 yolo
				//404 post inexistant ou user inexistant
				//503 serveur non joignable
				console.error(err)
			})
	}

	deleteComment(commentToDelete: Comment) {
		this.api.deleteV1ClientPostsUserTimestampCommentsCommenttimestamp(
			this.post.author, this.post.creationTs, commentToDelete.creationTs)
			.subscribe(() => {
				this.post.comments--
				let index = this.comments.indexOf(commentToDelete)
				this.commentList.nativeElement.children[index].classList.add('deletedComment')

				setTimeout(() => {
					this.comments = this.comments.filter((comment) => {
						return comment.creationTs != commentToDelete.creationTs
					})
				}, 500)
			}, err => {
				//500 yolo
				//404 post inexistant, user inexistant, ou commentaire non existant
				//503 serveur non joignable
				console.error(err)
			})
	}
}