import { Component, Input } from '@angular/core';
import { Post, CommentsArray, V1Service } from "../../providers/apiClient/index";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import DateFormaterService from "../../providers/date-formater";

/**
 * Generated class for the CommentsComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'comments-component',
  templateUrl: 'comments-component.html'
})
export class CommentsComponent {

  @Input() post: Post
	commentForm: FormGroup
	comments: CommentsArray = [
		{
			"author": "bobi@url.com",
			"content": "Can't touch this",
			"creationTs": 123456789,
			"lastEditTs": 123406789,
			"postAuthor":"",
			"postTs": 0
		},
		{
			"author": "felicie@rngo.com",
			"content": "LOL MDR XPTDR xDxDxDxD",
			"creationTs": 123456789,
			"lastEditTs": 123456789,
			"postAuthor":"",
			"postTs": 0
		}
	]

  constructor(public dateFormater: DateFormaterService, private api: V1Service) {
		this.commentForm = new FormGroup({"comment": new FormControl('', Validators.required)})
  }

	createComment() {

	}
}
