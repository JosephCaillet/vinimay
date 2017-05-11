webpackJsonp([0],{

/***/ 307:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_comments_component_comments_component__ = __webpack_require__(308);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__posts__ = __webpack_require__(312);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ngx_translate_core__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_post_component_post_component__ = __webpack_require__(309);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PostsModule", function() { return PostsModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






var PostsModule = (function () {
    function PostsModule() {
    }
    return PostsModule;
}());
PostsModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["a" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_3__posts__["a" /* PostsPage */],
            __WEBPACK_IMPORTED_MODULE_5__components_post_component_post_component__["a" /* PostComponent */],
            __WEBPACK_IMPORTED_MODULE_0__components_comments_component_comments_component__["a" /* CommentsComponent */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["d" /* IonicPageModule */].forChild(__WEBPACK_IMPORTED_MODULE_3__posts__["a" /* PostsPage */]),
            __WEBPACK_IMPORTED_MODULE_4__ngx_translate_core__["a" /* TranslateModule */].forChild()
        ],
        exports: [
            __WEBPACK_IMPORTED_MODULE_3__posts__["a" /* PostsPage */]
        ]
    })
], PostsModule);

//# sourceMappingURL=posts.module.js.map

/***/ }),

/***/ 308:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__providers_apiClient_index__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_date_formater__ = __webpack_require__(216);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CommentsComponent; });
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
 * Generated class for the CommentsComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
var CommentsComponent = (function () {
    function CommentsComponent(dateFormater, api) {
        this.dateFormater = dateFormater;
        this.api = api;
        this.comments = [];
        this.deleted = false;
        this.commentForm = new __WEBPACK_IMPORTED_MODULE_2__angular_forms__["e" /* FormGroup */]({ "comment": new __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* FormControl */]('', __WEBPACK_IMPORTED_MODULE_2__angular_forms__["g" /* Validators */].required) });
    }
    CommentsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.api.getV1ClientPostsUserTimestampComments(this.post.author, this.post.creationTs).subscribe(function (data) {
            _this.comments = data.comments;
        }, function (err) {
            console.error(err);
        });
    };
    CommentsComponent.prototype.createComment = function () {
        var _this = this;
        this.api.postV1ClientPostsUserTimestampComments(this.post.author, this.post.creationTs, { "content": this.commentForm.value.comment })
            .subscribe(function (data) {
            _this.commentForm.controls['comment'].setValue('');
            _this.comments.push(data);
        }, function (err) {
            console.error(err);
        });
    };
    CommentsComponent.prototype.deleteComment = function (commentToDelete) {
        var _this = this;
        this.api.deleteV1ClientPostsUserTimestampCommentsCommenttimestamp(this.post.author, this.post.creationTs, commentToDelete.creationTs)
            .subscribe(function () {
            var index = _this.comments.indexOf(commentToDelete);
            _this.commentList.nativeElement.children[index].classList.add('deletedComment');
            setTimeout(function () {
                _this.comments = _this.comments.filter(function (comment) {
                    return comment.creationTs != commentToDelete.creationTs;
                });
            }, 500);
        }, function (err) {
            console.error(err);
        });
    };
    return CommentsComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_9" /* ViewChild */])('commentsList'),
    __metadata("design:type", Object)
], CommentsComponent.prototype, "commentList", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["h" /* Input */])(),
    __metadata("design:type", Object)
], CommentsComponent.prototype, "post", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["h" /* Input */])(),
    __metadata("design:type", Object)
], CommentsComponent.prototype, "user", void 0);
CommentsComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
        selector: 'comments-component',template:/*ion-inline-start:"/home/joseph/Documents/web/vinimay/client/src/components/comments-component/comments-component.html"*/'<!-- Generated template for the CommentsComponent component -->\n<ion-list [class.deletedComment]="deleted" #commentsList>\n	<div *ngFor="let comment of comments">\n		<ion-row>\n			<ion-col>{{ comment.author.split(\'@\')[0] }} <i>@{{ comment.author.split(\'@\')[1] }}</i></ion-col>\n			<ion-col>\n				<ion-note>\n					<ion-icon name="calendar">&nbsp;&nbsp;</ion-icon>\n					{{ dateFormater.fullDate(comment.creationTs) }}\n				</ion-note>\n			</ion-col>\n			<ion-col>\n				<ion-note>\n					<div *ngIf="comment.creationTs != comment.lastEditTs">\n						<ion-icon name="create">&nbsp;&nbsp;</ion-icon>\n						{{ dateFormater.fullDate(comment.lastEditTs) }}\n					</div>\n				</ion-note>\n			</ion-col>\n		</ion-row>\n		<ion-row>\n			<ion-col col-11>{{ comment.content }}</ion-col>\n			<ion-col col-1 *ngIf="user.username + \'@\' + user.url == post.author || user.username + \'@\' + user.url == comment.author">\n				<button ion-button icon-only color="danger" (click)="deleteComment(comment)" small round outline>\n					<ion-icon name="trash"></ion-icon>\n				</button>\n			</ion-col>\n		</ion-row>\n	</div>\n\n	<form [formGroup]="commentForm" (submit)="createComment()">\n		<ion-row align-items-center text-center>\n			<ion-col col-9>\n				<ion-input [placeholder]=" \'p.comment_placeholder\' | translate " formControlName="comment"></ion-input>\n			</ion-col>\n			<ion-col col-3 text-center>\n				<button ion-button small icon-left type="submit" [disabled]="!commentForm.valid">\n					<ion-icon name="text"></ion-icon>\n					{{ \'p.comment_send\' | translate }}\n				</button>\n			</ion-col>\n		</ion-row>\n	</form>\n</ion-list>'/*ion-inline-end:"/home/joseph/Documents/web/vinimay/client/src/components/comments-component/comments-component.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_3__providers_date_formater__["a" /* default */], __WEBPACK_IMPORTED_MODULE_1__providers_apiClient_index__["a" /* V1Service */]])
], CommentsComponent);

//# sourceMappingURL=comments-component.js.map

/***/ }),

/***/ 309:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__providers_apiClient_index__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_date_formater__ = __webpack_require__(216);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PostComponent; });
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
 * Generated class for the PostComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
var PostComponent = (function () {
    function PostComponent(dateFormatter, api) {
        this.dateFormatter = dateFormatter;
        this.api = api;
        this.postDeleted = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["k" /* EventEmitter */]();
        this.PrivacyEnum = __WEBPACK_IMPORTED_MODULE_1__providers_apiClient_index__["b" /* Post */].PrivacyEnum;
        this.deleted = false;
    }
    PostComponent.prototype.ngOnInit = function () {
        this.post.content = this.post.content.replace(/\n/g, '<br>');
        this.creationDate = this.dateFormatter.fullDate(this.post.creationTs);
        if (this.post.lastEditTs && this.post.creationTs !== this.post.lastEditTs) {
            this.editionDate = this.dateFormatter.fullDate(this.post.lastEditTs);
        }
    };
    PostComponent.prototype.toggleReactionState = function () {
        var _this = this;
        if (this.post.reacted) {
            this.api.deleteV1ClientPostsUserTimestampReactions(this.user.username + '@' + this.user.url, this.post.creationTs)
                .subscribe(function () {
                _this.post.reactions--;
                _this.post.reacted = !_this.post.reacted;
            }, function (err) {
                console.error(err);
            });
        }
        else {
            this.api.postV1ClientPostsUserTimestampReactions(this.user.username + '@' + this.user.url, this.post.creationTs)
                .subscribe(function () {
                _this.post.reactions++;
                _this.post.reacted = !_this.post.reacted;
            }, function (err) {
                console.error(err);
            });
        }
    };
    return PostComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["h" /* Input */])(),
    __metadata("design:type", Object)
], PostComponent.prototype, "post", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["h" /* Input */])(),
    __metadata("design:type", Object)
], PostComponent.prototype, "user", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* Output */])(),
    __metadata("design:type", Object)
], PostComponent.prototype, "postDeleted", void 0);
PostComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
        selector: 'post-component',template:/*ion-inline-start:"/home/joseph/Documents/web/vinimay/client/src/components/post-component/post-component.html"*/'<!-- Generated template for the PostComponent component -->\n<ion-card [class.deletedPost]="deleted">\n	<ion-card-header [ngSwitch]="post.privacy">\n		<ion-row>\n			<ion-col col-11>\n				<ion-card-title no-margin no-padding>\n					{{ post.author.split(\'@\')[0] }}<i>@{{ post.author.split(\'@\')[1] }}</i>\n				</ion-card-title>\n			</ion-col>\n			<ion-col col-1 text-right>\n				<span *ngSwitchCase="PrivacyEnum.Public">\n					<ion-icon padding-right name="globe"></ion-icon>\n				</span>\n				<span *ngSwitchCase="PrivacyEnum.Friends">\n					<ion-icon padding-right name="people"></ion-icon>\n				</span>\n				<span *ngSwitchCase="PrivacyEnum.Private">\n					<ion-icon padding-right name="lock"></ion-icon>\n				</span>\n			</ion-col>\n		</ion-row>\n	</ion-card-header>\n\n	<ion-card-content>\n		<ion-row [innerHtml]="post.content">\n		</ion-row>\n		<ion-row>\n			<ion-col center text-center>\n				<button ion-button icon-left clear small (click)="toggleReactionState()">\n					<ion-icon name="thumbs-up" [color]=" post.reacted ? \'primary\' : \'light\'"></ion-icon>\n					<div>{{ post.reactions }} {{ post.reactions == 1 ? (\'p.reaction\' | translate) : (\'p.reactions\' | translate) }}</div>\n				</button>\n			</ion-col>\n			<ion-col center text-center>\n				<button ion-button icon-left clear small>\n					<ion-icon name="text"></ion-icon>\n					<div>{{ post.comments }} {{ post.comments == 1 ? (\'p.comment\' | translate) : (\'p.comments\' | translate) }}</div>\n				</button>\n			</ion-col>\n\n			<ion-col center text-center col-12 col-sm-3>\n				<ion-note>\n					<ion-icon name="calendar">&nbsp;&nbsp;</ion-icon>\n					<!--todo: replace non breakable space with css-->\n					{{ creationDate }}\n				</ion-note>\n			</ion-col>\n\n			<ion-col center text-center col-12 col-sm-3>\n				<ion-note>\n					<div *ngIf="editionDate">\n						<ion-icon name="create">&nbsp;&nbsp;</ion-icon>\n						{{ editionDate }}\n					</div>\n				</ion-note>\n			</ion-col>\n\n			<ion-col *ngIf="post.author == user.username + \'@\' + user.url" center text-center col-12>\n				<ion-row center text-center>\n					<ion-col col-6>\n						<button ion-button small icon-left outline>\n							<ion-icon name="create"></ion-icon>\n							{{ \'p.edit\' | translate }}\n						</button>\n					</ion-col>\n					<ion-col col-6>\n						<button ion-button small icon-left outline (click)="postDeleted.emit(post)" color="danger">\n							<ion-icon name="trash"></ion-icon>\n							{{ \'p.delete\' | translate }}\n						</button>\n					</ion-col>\n				</ion-row>\n			</ion-col>\n		</ion-row>\n\n		<comments-component [post]="post" [user]="user">\n\n		</comments-component>\n	</ion-card-content>\n</ion-card>'/*ion-inline-end:"/home/joseph/Documents/web/vinimay/client/src/components/post-component/post-component.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__providers_date_formater__["a" /* default */], __WEBPACK_IMPORTED_MODULE_1__providers_apiClient_index__["a" /* V1Service */]])
], PostComponent);

//# sourceMappingURL=post-component.js.map

/***/ }),

/***/ 312:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__providers_apiClient_api_v1_service__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_post_modal_post_modal__ = __webpack_require__(217);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ngx_translate_core__ = __webpack_require__(41);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PostsPage; });
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
 * Generated class for the Posts page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var PostsPage = (function () {
    function PostsPage(navCtrl, navParams, api, modCtrl, alertCtrl, tr) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.api = api;
        this.modCtrl = modCtrl;
        this.alertCtrl = alertCtrl;
        this.tr = tr;
        api.getV1ClientPosts().subscribe(function (data) {
            _this.posts = data.posts;
        }, function (err) {
            console.error(err);
        });
        this.user = this.navParams.data;
    }
    PostsPage.prototype.createPost = function () {
        var _this = this;
        var modal = this.modCtrl.create(__WEBPACK_IMPORTED_MODULE_3__components_post_modal_post_modal__["a" /* PostModal */], null, { showBackdrop: false, enableBackdropDismiss: false });
        modal.onDidDismiss(function (post) {
            if (post) {
                _this.posts.unshift(post);
            }
        });
        modal.present();
    };
    PostsPage.prototype.deletePost = function (deletedPost, postComponent) {
        var _this = this;
        var alert = this.alertCtrl.create({
            title: this.tr.instant('p.modal.delete.title'),
            message: this.tr.instant('p.modal.delete.message'),
            buttons: [
                {
                    text: this.tr.instant('global.yes'),
                    handler: function () {
                        _this.api.deleteV1ClientPostsTimestamp(deletedPost.creationTs).subscribe(function () {
                            postComponent.deleted = true;
                            setTimeout(function () {
                                console.log(_this.posts);
                                _this.posts = _this.posts.filter(function (post) {
                                    return post.creationTs != deletedPost.creationTs;
                                });
                            }, 1100);
                        }, function (err) {
                            console.error(err);
                        });
                    }
                },
                {
                    text: this.tr.instant('global.no'),
                    role: 'cancel'
                }
            ]
        });
        alert.present();
    };
    return PostsPage;
}());
PostsPage = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["e" /* IonicPage */])(),
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["_5" /* Component */])({
        selector: 'page-posts',template:/*ion-inline-start:"/home/joseph/Documents/web/vinimay/client/src/pages/posts/posts.html"*/'<!--\n  Generated template for the Posts page.\n\n  See http://ionicframework.com/docs/components/#navigation for more info on\n  Ionic pages and navigation.\n-->\n<ion-header>\n\n	<ion-navbar>\n		<ion-title>{{ \'app_name\' | translate }}</ion-title>\n	</ion-navbar>\n\n</ion-header>\n\n\n<ion-content padding>\n	<button ion-button icon-left (click)="createPost()" center>\n		<ion-icon name="create"></ion-icon>\n		{{ \'p.creation\' | translate }}\n	</button>\n	<post-component #postComponent *ngFor="let post of posts"\n		[post]="post" [user]="user"\n		(postDeleted)="deletePost($event, postComponent)">\n	</post-component>\n</ion-content>'/*ion-inline-end:"/home/joseph/Documents/web/vinimay/client/src/pages/posts/posts.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["g" /* NavParams */],
        __WEBPACK_IMPORTED_MODULE_0__providers_apiClient_api_v1_service__["a" /* V1Service */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["h" /* ModalController */],
        __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["i" /* AlertController */], __WEBPACK_IMPORTED_MODULE_4__ngx_translate_core__["c" /* TranslateService */]])
], PostsPage);

//# sourceMappingURL=posts.js.map

/***/ })

});
//# sourceMappingURL=0.main.js.map