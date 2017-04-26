import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddProfileModal } from './add-profile-modal';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddProfileModal,
  ],
  imports: [
    IonicPageModule.forChild(AddProfileModal),
		TranslateModule.forChild()
  ],
  exports: [
    AddProfileModal
  ]
})
export class AddProfileModalModule {}