
import { TranslateService } from "@ngx-translate/core";

let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' }

export default function dateFormatter(timeStamp: number, tr: TranslateService ): string {
	return 	Intl.DateTimeFormat(tr.getDefaultLang(), options).format(new Date(timeStamp))
}