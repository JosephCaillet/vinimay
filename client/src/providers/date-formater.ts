import { Injectable } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";

/*
  Generated class for the DateFormater provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export default class DateFormaterService {

	readonly options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' }

	constructor(public tr: TranslateService) {

  }

	fullDate(timeStamp: number): string {
		return 	Intl.DateTimeFormat(this.tr.getDefaultLang(), this.options).format(new Date(timeStamp))
	}

}