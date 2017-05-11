import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostComponent } from './post-component';
import { TranslateModule } from "@ngx-translate/core";
import { CommentsComponentModule } from "../comments-component/comments-component.module";

@NgModule({
  declarations: [
   PostComponent
  ],
  imports: [
    IonicPageModule.forChild(PostComponent),
		TranslateModule.forChild(),
		CommentsComponentModule
  ],
  exports: [
    PostComponent
  ]
})
export class PostComponentModule {}
