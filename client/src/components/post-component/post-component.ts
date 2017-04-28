import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from "../../providers/apiClient/index";
import { TranslateService } from "@ngx-translate/core";
import dateFormatter from "../../utils/dateFormater";

/**
 * Generated class for the PostComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'post-component',
  templateUrl: 'post-component.html'
})
export class PostComponent {

  @Input() post: Post
  @Input() editable: boolean
	@Output() postDeleted = new EventEmitter()
	PrivacyEnum = Post.PrivacyEnum
	creationDate: string
	editionDate: string

  constructor(public tr: TranslateService) {
  }

	ngOnInit() {
		this.post.content =	this.post.content.replace(/\n/g, '<br>')

		this.creationDate = dateFormatter(this.post.creationTs, this.tr,)
		if(this.post.lastEditTs && this.post.creationTs !== this.post.lastEditTs) {
			this.editionDate = dateFormatter(this.post.lastEditTs, this.tr)
		}
	}

}