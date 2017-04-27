import { Component, Input } from '@angular/core';
import { Post } from "../../providers/apiClient/index";

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

  constructor() {
    console.log('Hello PostComponent Component');
  }

}