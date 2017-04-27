import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostModal } from './post-modal';
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [
    PostModal,
  ],
  imports: [
    IonicPageModule.forChild(PostModal),
		TranslateModule.forChild()
  ],
  exports: [
    PostModal
  ]
})
export class PostModalModule {}
