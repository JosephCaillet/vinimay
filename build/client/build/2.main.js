webpackJsonp([2],{

/***/ 305:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ngx_translate_core__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__friends__ = __webpack_require__(310);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FriendsModule", function() { return FriendsModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




var FriendsModule = (function () {
    function FriendsModule() {
    }
    return FriendsModule;
}());
FriendsModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["a" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_3__friends__["a" /* FriendsPage */],
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["d" /* IonicPageModule */].forChild(__WEBPACK_IMPORTED_MODULE_3__friends__["a" /* FriendsPage */]),
            __WEBPACK_IMPORTED_MODULE_0__ngx_translate_core__["a" /* TranslateModule */].forChild()
        ],
        exports: [
            __WEBPACK_IMPORTED_MODULE_3__friends__["a" /* FriendsPage */]
        ]
    })
], FriendsModule);

//# sourceMappingURL=friends.module.js.map

/***/ }),

/***/ 310:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_add_profile_modal_add_profile_modal__ = __webpack_require__(215);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_apiClient_api_v1_service__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_apiClient_index__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ngx_translate_core__ = __webpack_require__(41);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FriendsPage; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






/**
 * Generated class for the Friends page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var FriendsPage = (function () {
    function FriendsPage(navCtrl, navParams, modCtrl, api, alertCtrl, tr) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.modCtrl = modCtrl;
        this.api = api;
        this.alertCtrl = alertCtrl;
        this.tr = tr;
        this.StatusEnum = __WEBPACK_IMPORTED_MODULE_4__providers_apiClient_index__["c" /* FriendSent */].StatusEnum;
        this.friends = {
            "sent": [],
            "incoming": [],
            "accepted": [],
            "following": []
        };
        api.getV1ClientFriends().subscribe(function (data) {
            _this.friends = data;
        }, function (err) {
            console.error(err);
        });
    }
    FriendsPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad Friends');
    };
    FriendsPage.prototype.addProfile = function () {
        var itGo = this.modCtrl.create(__WEBPACK_IMPORTED_MODULE_2__components_add_profile_modal_add_profile_modal__["a" /* AddProfileModal */], null, { showBackdrop: false, enableBackdropDismiss: false });
        itGo.present();
    };
    FriendsPage.prototype.cancelSentRequest = function (friend) {
        var alert = this.alertCtrl.create({
            title: this.tr.instant('f.sent.modal.cancel_title'),
            message: this.tr.instant('f.sent.modal.cancel_message', { user: friend.user }),
            buttons: [
                {
                    text: this.tr.instant('global.yes'),
                    handler: function () { }
                },
                {
                    text: this.tr.instant('global.no'),
                    role: 'cancel',
                    handler: function () { }
                }
            ]
        });
        alert.present();
    };
    FriendsPage.prototype.hideRejectedSentRequest = function (friend) {
    };
    FriendsPage.prototype.showFriendDetails = function (friend) {
        var alert = this.alertCtrl.create({
            subTitle: "" + friend.user,
            message: "" + friend.description,
            buttons: [this.tr.instant('global.ok')]
        });
        alert.present();
    };
    FriendsPage.prototype.acceptFriendRequest = function (friend) {
    };
    FriendsPage.prototype.declineFriendRequest = function (friend) {
        var alert = this.alertCtrl.create({
            title: this.tr.instant('f.received.modal.decline_title'),
            message: this.tr.instant('f.received.modal.decline_message', { user: friend.user }),
            buttons: [
                {
                    text: this.tr.instant('global.yes'),
                    handler: function () { }
                },
                {
                    text: this.tr.instant('global.no'),
                    role: 'cancel'
                }
            ]
        });
        alert.present();
    };
    FriendsPage.prototype.removeFriend = function (friend) {
        var alert = this.alertCtrl.create({
            title: this.tr.instant('f.friend.modal.remove_title'),
            message: this.tr.instant('f.friend.modal.remove_message', { user: friend.user }),
            buttons: [
                {
                    text: this.tr.instant('global.yes'),
                    handler: function () { }
                },
                {
                    text: this.tr.instant('global.no'),
                    role: 'cancel'
                }
            ]
        });
        alert.present();
    };
    return FriendsPage;
}());
FriendsPage = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* IonicPage */])(),
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
        selector: 'page-friends',template:/*ion-inline-start:"/home/joseph/Documents/web/vinimay/client/src/pages/friends/friends.html"*/'<!--\n	Generated template for the Friends page.\n\n	See http://ionicframework.com/docs/components/#navigation for more info on\n	Ionic pages and navigation.\n-->\n<ion-header>\n\n	<ion-navbar>\n		<ion-title>{{ \'app_name\' | translate }}</ion-title>\n	</ion-navbar>\n\n</ion-header>\n\n\n<ion-content padding>\n\n	<h1>{{\'f.add.title\' | translate}}</h1>\n	<button ion-button icon-left (click)="addProfile()">\n		<ion-icon name="person-add"></ion-icon>\n		Add\n	</button>\n\n\n	<h1 *ngIf="friends.sent.length != 0">{{\'f.sent.title\' | translate}}</h1>\n	<div *ngFor="let sent of friends.sent" [ngSwitch]="sent.status" class="vertical-align-content">\n		<span margin-horizontal>\n			{{ sent.user.split(\'@\')[0] }}<i>@{{ sent.user.split(\'@\')[1] }}</i>\n		</span>\n\n		<span *ngSwitchCase="StatusEnum.Pending">\n			<button ion-button icon-left small color="danger" (click)="cancelSentRequest(sent)">\n				<ion-icon name="trash"></ion-icon>\n					{{ \'f.sent.cancel\' | translate}}\n			</button>\n		</span>\n\n		<span *ngSwitchCase="StatusEnum.Declined">\n			{{ \'f.sent.rejected\' | translate }}\n		</span>\n\n		<span *ngSwitchCase="StatusEnum.Declined">\n			<button ion-button icon-left small margin-horizontal (click)="hideRejectedSentRequest(sent)">\n				<ion-icon name="close"></ion-icon>\n					{{ \'f.sent.hide\' | translate}}\n			</button>\n		</span>\n	</div>\n\n\n	<h1 *ngIf="friends.incoming.length != 0">{{\'f.received.title\' | translate}}</h1>\n	<div *ngFor="let received of friends.incoming" class="vertical-align-content">\n		<span margin-horizontal>\n			{{ received.user.split(\'@\')[0] }}<i>@{{ received.user.split(\'@\')[1] }}</i>\n		</span>\n		<button ion-button icon-left small (click)="showFriendDetails(received)">\n				<ion-icon name="more"></ion-icon>\n				{{ \'f.received.details\' | translate}}\n		</button>\n		<button ion-button icon-left small color="secondary" (click)="acceptFriendRequest(received)">\n			<ion-icon name="person-add"></ion-icon>\n				{{ \'f.received.accept\' | translate}}\n		</button>\n		<button ion-button icon-left small color="danger" (click)="declineFriendRequest(received)">\n			<ion-icon name="trash"></ion-icon>\n			{{ \'f.received.decline\' | translate}}\n		</button>\n	</div>\n\n\n	<h1 *ngIf="friends.accepted.length != 0">{{\'f.friend.title\' | translate}}</h1>\n	<div *ngFor="let friend of friends.accepted" class="vertical-align-content">\n		<span margin-horizontal>\n			{{ friend.user.split(\'@\')[0] }}<i>@{{ friend.user.split(\'@\')[1] }}</i>\n		</span>\n		<button ion-button icon-left small (click)="showFriendDetails(friend)">\n				<ion-icon name="more"></ion-icon>\n				{{ \'f.friend.details\' | translate}}\n		</button>\n		<button ion-button icon-left small color="danger" (click)="removeFriend(friend)">\n			<ion-icon name="trash"></ion-icon>\n			{{ \'f.friend.remove\' | translate}}\n		</button>\n	</div>\n\n\n	<h1 *ngIf="friends.following.length != 0">{{\'f.following.title\' | translate}}</h1>\n	<div *ngFor="let follow of friends.following" class="vertical-align-content">\n		<span margin-horizontal>\n			{{ follow.user.split(\'@\')[0] }}<i>@{{ follow.user.split(\'@\')[1] }}</i>\n		</span>\n		<button ion-button icon-left small (click)="showFriendDetails(follow)">\n				<ion-icon name="more"></ion-icon>\n				{{ \'f.following.details\' | translate}}\n		</button>\n		<button ion-button icon-left small color="danger" (click)="removeFriend(follow)">\n			<ion-icon name="trash"></ion-icon>\n			{{ \'f.following.remove\' | translate}}\n		</button>\n	</div>\n\n</ion-content>'/*ion-inline-end:"/home/joseph/Documents/web/vinimay/client/src/pages/friends/friends.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* ModalController */], __WEBPACK_IMPORTED_MODULE_3__providers_apiClient_api_v1_service__["a" /* V1Service */],
        __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* AlertController */], __WEBPACK_IMPORTED_MODULE_5__ngx_translate_core__["c" /* TranslateService */]])
], FriendsPage);

//# sourceMappingURL=friends.js.map

/***/ })

});
//# sourceMappingURL=2.main.js.map