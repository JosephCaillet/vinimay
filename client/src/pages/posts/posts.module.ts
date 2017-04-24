import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostsPage } from './posts';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PostsPage,
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
