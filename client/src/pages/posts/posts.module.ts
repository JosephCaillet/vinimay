import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostsPage } from './posts';
import { TranslateModule } from '@ngx-translate/core';
import { PostComponent } from "../../components/post-component/post-component";
import { CommentsComponent } from "../../components/comments-component/comments-component";

@NgModule({
  declarations: [
    PostsPage,
		PostComponent,
		CommentsComponent
  ],
  imports: [
    IonicPageModule.forChild(PostsPage),
		TranslateModule.forChild()
  ],
  exports: [
    PostsPage
  ]
})
export class PostsModule {}
