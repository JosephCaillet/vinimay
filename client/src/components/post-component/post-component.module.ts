import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostComponent } from './post-component';

@NgModule({
  declarations: [
    PostComponent,
  ],
  imports: [
    IonicPageModule.forChild(PostComponent),
  ],
  exports: [
    PostComponent
  ]
})
export class PostComponentModule {}
