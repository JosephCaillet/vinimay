import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendsPage } from './friends';

@NgModule({
  declarations: [
    FriendsPage,
  ],
  imports: [
    IonicPageModule.forChild(FriendsPage),
		TranslateModule.forChild()
  ],
  exports: [
    FriendsPage
  ]
})
export class FriendsModule {}