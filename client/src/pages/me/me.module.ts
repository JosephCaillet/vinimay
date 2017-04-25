import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MePage } from './me';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MePage,
  ],
  imports: [
    IonicPageModule.forChild(MePage),
		TranslateModule.forChild()
  ],
  exports: [
    MePage
  ]
})
export class MeModule {}
