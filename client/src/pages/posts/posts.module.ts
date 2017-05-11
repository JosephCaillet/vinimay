import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostsPage } from './posts';
import { TranslateModule } from '@ngx-translate/core';
import { PostComponentModule } from "../../components/post-component/post-component.module";

@NgModule({
  declarations: [
    PostsPage
  ],
  imports: [
    IonicPageModule.forChild(PostsPage),
		TranslateModule.forChild(),
		PostComponentModule,
  ],
  exports: [
    PostsPage
  ]
})
export class PostsModule {}
