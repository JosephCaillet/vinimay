import { IonicPage, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

/**
 * Generated class for the AddProfileModal component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@IonicPage()
@Component({
  selector: 'add-profile-modal',
  templateUrl: 'add-profile-modal.html'
})
export class AddProfileModal {

  url = '';
	relationType = 'friend'

  constructor(private viewCtrl: ViewController) {
  }


  dismiss(cancel: boolean) {
    if(cancel) {
			this.viewCtrl.dismiss(false);
		} else {
			this.viewCtrl.dismiss({"url": this.url, "rel": this.relationType})
		}
  }
}
