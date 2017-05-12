import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommentsComponent } from './comments-component';
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [
    CommentsComponent,
  ],
  imports: [
    IonicPageModule.forChild(CommentsComponent),
		TranslateModule.forChild(),
  ],
  exports: [
    CommentsComponent
  ]
})
export class CommentsComponentModule {}