import { AddProfileModal } from './../components/add-profile-modal/add-profile-modal';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, APP_INITIALIZER } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ConfigurationService } from "ionic-configuration-service";

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpModule, Http } from '@angular/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { V1Service } from '../providers/apiClient/api/v1.service';
//import { BASE_PATH } from '../providers/apiClient/variables';
import { PostModal } from "../components/post-modal/post-modal";
import { Autoresize } from "../components/autoresize/autoresize";
import DateFormaterService from "../providers/date-formater";
//let Config = require("../config");

@NgModule({
	declarations: [
		MyApp,
		HomePage,
		AddProfileModal,
		PostModal,
		Autoresize
	],
	imports: [
		BrowserModule,
		HttpModule,
		IonicModule.forRoot(MyApp, {
			platforms: {
				core: {
					tabsPlacement: 'top'
				}
			}
		}),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [Http]
			}
		})
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		HomePage,
		AddProfileModal,
		PostModal
	],
	providers: [
		StatusBar,
		//{ provide: StatusBar, useClass: StatusBar },
		SplashScreen,
		//{ provide: SplashScreen, useClass: SplashScreen },
		ConfigurationService,
		//{ provide: ConfigurationService, useClass: ConfigurationService },
		{
			provide: APP_INITIALIZER,
      useFactory: loadConfiguration,
      deps: [ConfigurationService],
			multi: true
		},
		{ provide: V1Service, useFactory: createAPIEndpointLoader, deps: [Http, ConfigurationService] },
		//[V1Service, { provide: BASE_PATH, useFactory: (createAPIEndpointLoader), deps: [Http] }],
		//[V1Service, { provide: BASE_PATH, useValue: Config.apiEndpoint }],
		// { provide: LOCALE_ID, useValue: 'en-EN' },
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		DateFormaterService
	]
})
export class AppModule { }

export function createTranslateLoader(http: Http) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

export function loadConfiguration(conf: ConfigurationService) {
	return () => conf.load("config.json");
}

export function createAPIEndpointLoader(http: Http, conf: ConfigurationService) {
	return new V1Service(http, conf.getValue<string>('apiEndpoint'), null)
}