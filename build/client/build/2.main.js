webpackJsonp([2],{362:function(n,l,t){"use strict";Object.defineProperty(l,"__esModule",{value:!0});var e=t(0),u=t(375),i=t(10),a=t(11),o=t(149),r=t(32),_=t(64),s=t(65),c=t(63),d=t(23),f=t(231),m=t(232),h=t(233),p=t(234),g=t(235),b=t(236),v=t(237),y=t(238),w=t(239),F=t(376),T=t(96),S=t(367),O=t(46);t.d(l,"FriendsModuleNgFactory",function(){return V});var U=this&&this.__extends||function(){var n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,l){n.__proto__=l}||function(n,l){for(var t in l)l.hasOwnProperty(t)&&(n[t]=l[t])};return function(l,t){function e(){this.constructor=l}n(l,t),l.prototype=null===t?Object.create(t):(e.prototype=t.prototype,new e)}}(),x=function(n){function l(l){return n.call(this,l,[f.a,m.a,h.a,p.a,g.a,b.a,v.a,y.a,w.a,F.a],[])||this}return U(l,n),Object.defineProperty(l.prototype,"_NgLocalization_8",{get:function(){return null==this.__NgLocalization_8&&(this.__NgLocalization_8=new i.a(this.parent.get(e.c))),this.__NgLocalization_8},enumerable:!0,configurable:!0}),Object.defineProperty(l.prototype,"_ɵi_9",{get:function(){return null==this.__ɵi_9&&(this.__ɵi_9=new a.a),this.__ɵi_9},enumerable:!0,configurable:!0}),Object.defineProperty(l.prototype,"_FormBuilder_10",{get:function(){return null==this.__FormBuilder_10&&(this.__FormBuilder_10=new a.b),this.__FormBuilder_10},enumerable:!0,configurable:!0}),Object.defineProperty(l.prototype,"_TranslateLoader_12",{get:function(){return null==this.__TranslateLoader_12&&(this.__TranslateLoader_12=new _.b),this.__TranslateLoader_12},enumerable:!0,configurable:!0}),Object.defineProperty(l.prototype,"_TranslateParser_13",{get:function(){return null==this.__TranslateParser_13&&(this.__TranslateParser_13=new s.a),this.__TranslateParser_13},enumerable:!0,configurable:!0}),Object.defineProperty(l.prototype,"_MissingTranslationHandler_14",{get:function(){return null==this.__MissingTranslationHandler_14&&(this.__MissingTranslationHandler_14=new c.a),this.__MissingTranslationHandler_14},enumerable:!0,configurable:!0}),Object.defineProperty(l.prototype,"_TranslateService_16",{get:function(){return null==this.__TranslateService_16&&(this.__TranslateService_16=new d.a(this.parent.get(T.a),this._TranslateLoader_12,this._TranslateParser_13,this._MissingTranslationHandler_14,this._USE_STORE_15)),this.__TranslateService_16},enumerable:!0,configurable:!0}),l.prototype.createInternal=function(){return this._CommonModule_0=new i.d,this._ɵba_1=new a.c,this._FormsModule_2=new a.d,this._ReactiveFormsModule_3=new a.e,this._IonicModule_4=new o.b,this._IonicPageModule_5=new o.c,this._TranslateModule_6=new r.a,this._FriendsModule_7=new u.a,this._LAZY_LOADED_TOKEN_11=S.a,this._USE_STORE_15=void 0,this._FriendsModule_7},l.prototype.getInternal=function(n,l){return n===i.d?this._CommonModule_0:n===a.c?this._ɵba_1:n===a.d?this._FormsModule_2:n===a.e?this._ReactiveFormsModule_3:n===o.b?this._IonicModule_4:n===o.c?this._IonicPageModule_5:n===r.a?this._TranslateModule_6:n===u.a?this._FriendsModule_7:n===i.e?this._NgLocalization_8:n===a.a?this._ɵi_9:n===a.b?this._FormBuilder_10:n===O.d?this._LAZY_LOADED_TOKEN_11:n===_.a?this._TranslateLoader_12:n===s.b?this._TranslateParser_13:n===c.b?this._MissingTranslationHandler_14:n===d.b?this._USE_STORE_15:n===d.a?this._TranslateService_16:l},l.prototype.destroyInternal=function(){},l}(e.x),V=new e.y(x,u.a)},367:function(n,l,t){"use strict";var e=(t(0),t(40),t(98)),u=(t(33),t(97));t(32);t.d(l,"a",function(){return i});var i=(this&&this.__decorate,this&&this.__metadata,function(){function n(n,l,t,e,i,a,o){var r=this;this.navCtrl=n,this.navParams=l,this.modCtrl=t,this.api=e,this.alertCtrl=i,this.tr=a,this.loadingCtrl=o,this.StatusEnum=u.FriendSent.StatusEnum,this.friends={sent:[],incoming:[],accepted:[],following:[]};var _=o.create({content:a.instant("f.loading")});_.present(),e.getV1ClientFriends().subscribe(function(n){r.friends=n,_.dismiss()},function(n){console.error(n),_.dismiss()})}return n.prototype.ionViewDidLoad=function(){},n.prototype.addProfile=function(){var n=this,l=this.modCtrl.create(e.a,null);l.onDidDismiss(function(l,t){if(l)if(console.log("data:"),console.log(l),console.log(t),l.type==u.FriendInput.TypeEnum.Following)n.friends.following.push(t);else{var e={user:t.user,status:u.FriendSent.StatusEnum.Pending};n.friends.sent=n.friends.sent.filter(function(n){return n.user!=e.user}),n.friends.sent.push(e),n.friends.following=n.friends.following.filter(function(n){return n.user!=e.user})}}),l.present()},n.prototype.cancelSentRequest=function(n){this.alertCtrl.create({title:this.tr.instant("f.sent.modal.cancel_title"),message:this.tr.instant("f.sent.modal.cancel_message",{user:n.user}),buttons:[{text:this.tr.instant("global.yes"),handler:function(){}},{text:this.tr.instant("global.no"),role:"cancel",handler:function(){}}]}).present()},n.prototype.hideRejectedSentRequest=function(n){},n.prototype.showFriendDetails=function(n){this.alertCtrl.create({subTitle:""+n.user,message:""+n.description,buttons:[this.tr.instant("global.close")]}).present()},n.prototype.acceptFriendRequest=function(n){},n.prototype.declineFriendRequest=function(n){this.alertCtrl.create({title:this.tr.instant("f.received.modal.decline_title"),message:this.tr.instant("f.received.modal.decline_message",{user:n.user}),buttons:[{text:this.tr.instant("global.yes"),handler:function(){}},{text:this.tr.instant("global.no"),role:"cancel"}]}).present()},n.prototype.removeFriend=function(n){this.alertCtrl.create({title:this.tr.instant("f.friend.modal.remove_title"),message:this.tr.instant("f.friend.modal.remove_message",{user:n.user}),buttons:[{text:this.tr.instant("global.yes"),handler:function(){}},{text:this.tr.instant("global.no"),role:"cancel"}]}).present()},n}())},375:function(n,l,t){"use strict";t(32),t(0),t(40),t(367);t.d(l,"a",function(){return e});var e=(this&&this.__decorate,function(){function n(){}return n}())},376:function(n,l,t){"use strict";function e(n){return p._17(0,[(n()(),p._18(0,null,null,2,"h1",[],null,null,null,null,null)),(n()(),p._20(null,["",""])),p._21(65536,g.a,[b.a,p._5])],null,function(n,l){n(l,1,0,p._23(l,1,0,p._22(l,2).transform("f.sent.title")))})}function u(n){return p._17(0,[(n()(),p._18(0,null,null,9,"span",[],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t\t"])),(n()(),p._18(0,null,null,6,"button",[["color","danger"],["icon-left",""],["ion-button",""],["small",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.cancelSentRequest(n.parent.context.$implicit)&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],{color:[0,"color"],small:[1,"small"]},null),(n()(),p._20(0,["\n\t\t\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","trash"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\t\t\t\t","\n\t\t\t"])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(null,["\n\t\t"]))],function(n,l){n(l,3,0,"danger","");n(l,6,0,"trash")},function(n,l){n(l,5,0,p._22(l,6)._hidden),n(l,7,0,p._23(l,7,0,p._22(l,8).transform("f.sent.cancel")))})}function i(n){return p._17(0,[(n()(),p._18(0,null,null,2,"span",[],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t\t","\n\t\t"])),p._21(65536,g.a,[b.a,p._5])],null,function(n,l){n(l,1,0,p._23(l,1,0,p._22(l,2).transform("f.sent.rejected")))})}function a(n){return p._17(0,[(n()(),p._18(0,null,null,9,"span",[],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t\t"])),(n()(),p._18(0,null,null,6,"button",[["icon-left",""],["ion-button",""],["margin-horizontal",""],["small",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.hideRejectedSentRequest(n.parent.context.$implicit)&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],{small:[0,"small"]},null),(n()(),p._20(0,["\n\t\t\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","close"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\t\t\t\t","\n\t\t\t"])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(null,["\n\t\t"]))],function(n,l){n(l,3,0,"");n(l,6,0,"close")},function(n,l){n(l,5,0,p._22(l,6)._hidden),n(l,7,0,p._23(l,7,0,p._22(l,8).transform("f.sent.hide")))})}function o(n){return p._17(0,[(n()(),p._18(0,null,null,17,"div",[["class","vertical-align-content"]],null,null,null,null,null)),p._19(8192,null,0,T.n,[],{ngSwitch:[0,"ngSwitch"]},null),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,4,"span",[["margin-horizontal",""]],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t\t",""])),(n()(),p._18(0,null,null,1,"i",[],null,null,null,null,null)),(n()(),p._20(null,["@",""])),(n()(),p._20(null,["\n\t\t"])),(n()(),p._20(null,["\n\n\t\t"])),(n()(),p._24(8388608,null,null,1,null,u)),p._19(139264,null,0,T.o,[p.Y,p.Z,T.n],{ngSwitchCase:[0,"ngSwitchCase"]},null),(n()(),p._20(null,["\n\n\t\t"])),(n()(),p._24(8388608,null,null,1,null,i)),p._19(139264,null,0,T.o,[p.Y,p.Z,T.n],{ngSwitchCase:[0,"ngSwitchCase"]},null),(n()(),p._20(null,["\n\n\t\t"])),(n()(),p._24(8388608,null,null,1,null,a)),p._19(139264,null,0,T.o,[p.Y,p.Z,T.n],{ngSwitchCase:[0,"ngSwitchCase"]},null),(n()(),p._20(null,["\n\t"]))],function(n,l){var t=l.component;n(l,1,0,l.context.$implicit.status),n(l,10,0,t.StatusEnum.Pending),n(l,13,0,t.StatusEnum.Declined),n(l,16,0,t.StatusEnum.Declined)},function(n,l){n(l,4,0,l.context.$implicit.user.split("@")[0]),n(l,6,0,l.context.$implicit.user.split("@")[1])})}function r(n){return p._17(0,[(n()(),p._18(0,null,null,2,"h1",[],null,null,null,null,null)),(n()(),p._20(null,["",""])),p._21(65536,g.a,[b.a,p._5])],null,function(n,l){n(l,1,0,p._23(l,1,0,p._22(l,2).transform("f.received.title")))})}function _(n){return p._17(0,[(n()(),p._18(0,null,null,31,"div",[["class","vertical-align-content"]],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,4,"span",[["margin-horizontal",""]],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t\t",""])),(n()(),p._18(0,null,null,1,"i",[],null,null,null,null,null)),(n()(),p._20(null,["@",""])),(n()(),p._20(null,["\n\t\t"])),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,6,"button",[["icon-left",""],["ion-button",""],["small",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.showFriendDetails(n.context.$implicit)&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],{small:[0,"small"]},null),(n()(),p._20(0,["\n\t\t\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","more"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\t\t\t","\n\t\t"])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,6,"button",[["color","secondary"],["icon-left",""],["ion-button",""],["small",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.acceptFriendRequest(n.context.$implicit)&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],{color:[0,"color"],small:[1,"small"]},null),(n()(),p._20(0,["\n\t\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","person-add"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\t\t\t","\n\t\t"])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,6,"button",[["color","danger"],["icon-left",""],["ion-button",""],["small",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.declineFriendRequest(n.context.$implicit)&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],{color:[0,"color"],small:[1,"small"]},null),(n()(),p._20(0,["\n\t\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","trash"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\t\t","\n\t\t"])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(null,["\n\t"]))],function(n,l){n(l,9,0,"");n(l,12,0,"more");n(l,17,0,"secondary","");n(l,20,0,"person-add");n(l,25,0,"danger","");n(l,28,0,"trash")},function(n,l){n(l,3,0,l.context.$implicit.user.split("@")[0]),n(l,5,0,l.context.$implicit.user.split("@")[1]),n(l,11,0,p._22(l,12)._hidden),n(l,13,0,p._23(l,13,0,p._22(l,14).transform("f.received.details"))),n(l,19,0,p._22(l,20)._hidden),n(l,21,0,p._23(l,21,0,p._22(l,22).transform("f.received.accept"))),n(l,27,0,p._22(l,28)._hidden),n(l,29,0,p._23(l,29,0,p._22(l,30).transform("f.received.decline")))})}function s(n){return p._17(0,[(n()(),p._18(0,null,null,2,"h1",[],null,null,null,null,null)),(n()(),p._20(null,["",""])),p._21(65536,g.a,[b.a,p._5])],null,function(n,l){n(l,1,0,p._23(l,1,0,p._22(l,2).transform("f.friend.title")))})}function c(n){return p._17(0,[(n()(),p._18(0,null,null,23,"div",[["class","vertical-align-content"]],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,4,"span",[["margin-horizontal",""]],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t\t",""])),(n()(),p._18(0,null,null,1,"i",[],null,null,null,null,null)),(n()(),p._20(null,["@",""])),(n()(),p._20(null,["\n\t\t"])),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,6,"button",[["icon-left",""],["ion-button",""],["small",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.showFriendDetails(n.context.$implicit)&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],{small:[0,"small"]},null),(n()(),p._20(0,["\n\t\t\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","more"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\t\t\t","\n\t\t"])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,6,"button",[["color","danger"],["icon-left",""],["ion-button",""],["small",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.removeFriend(n.context.$implicit)&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],{color:[0,"color"],small:[1,"small"]},null),(n()(),p._20(0,["\n\t\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","trash"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\t\t","\n\t\t"])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(null,["\n\t"]))],function(n,l){n(l,9,0,"");n(l,12,0,"more");n(l,17,0,"danger","");n(l,20,0,"trash")},function(n,l){n(l,3,0,l.context.$implicit.user.split("@")[0]),n(l,5,0,l.context.$implicit.user.split("@")[1]),n(l,11,0,p._22(l,12)._hidden),n(l,13,0,p._23(l,13,0,p._22(l,14).transform("f.friend.details"))),n(l,19,0,p._22(l,20)._hidden),n(l,21,0,p._23(l,21,0,p._22(l,22).transform("f.friend.remove")))})}function d(n){return p._17(0,[(n()(),p._18(0,null,null,2,"h1",[],null,null,null,null,null)),(n()(),p._20(null,["",""])),p._21(65536,g.a,[b.a,p._5])],null,function(n,l){n(l,1,0,p._23(l,1,0,p._22(l,2).transform("f.following.title")))})}function f(n){return p._17(0,[(n()(),p._18(0,null,null,23,"div",[["class","vertical-align-content"]],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,4,"span",[["margin-horizontal",""]],null,null,null,null,null)),(n()(),p._20(null,["\n\t\t\t",""])),(n()(),p._18(0,null,null,1,"i",[],null,null,null,null,null)),(n()(),p._20(null,["@",""])),(n()(),p._20(null,["\n\t\t"])),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,6,"button",[["icon-left",""],["ion-button",""],["small",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.showFriendDetails(n.context.$implicit)&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],{small:[0,"small"]},null),(n()(),p._20(0,["\n\t\t\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","more"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\t\t\t","\n\t\t"])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(null,["\n\t\t"])),(n()(),p._18(0,null,null,6,"button",[["color","danger"],["icon-left",""],["ion-button",""],["small",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.removeFriend(n.context.$implicit)&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],{color:[0,"color"],small:[1,"small"]},null),(n()(),p._20(0,["\n\t\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","trash"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\t\t","\n\t\t"])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(null,["\n\t"]))],function(n,l){n(l,9,0,"");n(l,12,0,"more");n(l,17,0,"danger","");n(l,20,0,"trash")},function(n,l){n(l,3,0,l.context.$implicit.user.split("@")[0]),n(l,5,0,l.context.$implicit.user.split("@")[1]),n(l,11,0,p._22(l,12)._hidden),n(l,13,0,p._23(l,13,0,p._22(l,14).transform("f.following.details"))),n(l,19,0,p._22(l,20)._hidden),n(l,21,0,p._23(l,21,0,p._22(l,22).transform("f.following.remove")))})}function m(n){return p._17(0,[(n()(),p._20(null,["\n"])),(n()(),p._18(0,null,null,11,"ion-header",[],null,null,null,null,null)),p._19(8192,null,0,S.a,[w.c,p.U,p.V,[2,O.a]],null,null),(n()(),p._20(null,["\n\n\t"])),(n()(),p._18(0,null,null,7,"ion-navbar",[["class","toolbar"]],[[8,"hidden",0],[2,"statusbar-padding",null]],null,null,U.a,U.b)),p._19(24576,null,0,x.a,[V.a,[2,O.a],[2,k.a],w.c,p.U,p.V],null,null),(n()(),p._20(3,["\n\t\t"])),(n()(),p._18(0,null,3,3,"ion-title",[],null,null,null,P.a,P.b)),p._19(24576,null,0,M.a,[w.c,p.U,p.V,[2,C.a],[2,x.a]],null,null),(n()(),p._20(0,["",""])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(3,["\n\t"])),(n()(),p._20(null,["\n\n"])),(n()(),p._20(null,["\n\n\n"])),(n()(),p._18(0,null,null,37,"ion-content",[["padding",""]],[[2,"statusbar-padding",null]],null,null,$.a,$.b)),p._19(2187264,null,0,E.a,[w.c,I.b,L.a,p.U,p.V,V.a,R.a,p.g,[2,O.a],[2,k.a]],null,null),(n()(),p._20(1,["\n\n\t"])),(n()(),p._18(0,null,1,2,"h1",[],null,null,null,null,null)),(n()(),p._20(null,["",""])),p._21(65536,g.a,[b.a,p._5]),(n()(),p._20(1,["\n\t"])),(n()(),p._18(0,null,1,5,"button",[["icon-left",""],["ion-button",""]],null,[[null,"click"]],function(n,l,t){var e=!0,u=n.component;if("click"===l){e=!1!==u.addProfile()&&e}return e},v.a,v.b)),p._19(548864,null,0,y.a,[[8,""],w.c,p.U,p.V],null,null),(n()(),p._20(0,["\n\t\t"])),(n()(),p._18(0,null,0,1,"ion-icon",[["name","person-add"],["role","img"]],[[2,"hide",null]],null,null,null,null)),p._19(73728,null,0,F.a,[w.c,p.U,p.V],{name:[0,"name"]},null),(n()(),p._20(0,["\n\t\tAdd\n\t"])),(n()(),p._20(1,["\n\n\n\t"])),(n()(),p._24(8388608,null,1,1,null,e)),p._19(8192,null,0,T.k,[p.Y,p.Z],{ngIf:[0,"ngIf"]},null),(n()(),p._20(1,["\n\t"])),(n()(),p._24(8388608,null,1,1,null,o)),p._19(401408,null,0,T.l,[p.Y,p.Z,p.t],{ngForOf:[0,"ngForOf"]},null),(n()(),p._20(1,["\n\n\n\t"])),(n()(),p._24(8388608,null,1,1,null,r)),p._19(8192,null,0,T.k,[p.Y,p.Z],{ngIf:[0,"ngIf"]},null),(n()(),p._20(1,["\n\t"])),(n()(),p._24(8388608,null,1,1,null,_)),p._19(401408,null,0,T.l,[p.Y,p.Z,p.t],{ngForOf:[0,"ngForOf"]},null),(n()(),p._20(1,["\n\n\n\t"])),(n()(),p._24(8388608,null,1,1,null,s)),p._19(8192,null,0,T.k,[p.Y,p.Z],{ngIf:[0,"ngIf"]},null),(n()(),p._20(1,["\n\t"])),(n()(),p._24(8388608,null,1,1,null,c)),p._19(401408,null,0,T.l,[p.Y,p.Z,p.t],{ngForOf:[0,"ngForOf"]},null),(n()(),p._20(1,["\n\n\n\t"])),(n()(),p._24(8388608,null,1,1,null,d)),p._19(8192,null,0,T.k,[p.Y,p.Z],{ngIf:[0,"ngIf"]},null),(n()(),p._20(1,["\n\t"])),(n()(),p._24(8388608,null,1,1,null,f)),p._19(401408,null,0,T.l,[p.Y,p.Z,p.t],{ngForOf:[0,"ngForOf"]},null),(n()(),p._20(1,["\n\n"]))],function(n,l){var t=l.component;n(l,25,0,"person-add"),n(l,29,0,0!=t.friends.sent.length),n(l,32,0,t.friends.sent),n(l,35,0,0!=t.friends.incoming.length),n(l,38,0,t.friends.incoming),n(l,41,0,0!=t.friends.accepted.length),n(l,44,0,t.friends.accepted),n(l,47,0,0!=t.friends.following.length),n(l,50,0,t.friends.following)},function(n,l){n(l,4,0,p._22(l,5)._hidden,p._22(l,5)._sbPadding),n(l,9,0,p._23(l,9,0,p._22(l,10).transform("app_name"))),n(l,14,0,p._22(l,15).statusbarPadding),n(l,18,0,p._23(l,18,0,p._22(l,19).transform("f.add.title"))),n(l,24,0,p._22(l,25)._hidden)})}function h(n){return p._17(0,[(n()(),p._18(0,null,null,1,"page-friends",[],null,null,null,m,A)),p._19(24576,null,0,j.a,[k.a,D.a,Y.a,Z.a,z.a,b.a,q.a],null,null)],null,null)}var p=t(0),g=t(53),b=t(23),v=t(24),y=t(17),w=t(1),F=t(26),T=t(10),S=t(66),O=t(4),U=t(151),x=t(27),V=t(5),k=t(12),P=t(152),M=t(54),C=t(41),$=t(150),E=t(21),I=t(3),L=t(6),R=t(18),j=t(367),D=t(14),Y=t(100),Z=t(33),z=t(99),q=t(47);t.d(l,"a",function(){return H});var N=[],A=p._16({encapsulation:2,styles:N,data:{}}),H=p._25("page-friends",j.a,h,{},{},[])}});
//# sourceMappingURL=/home/joseph/Documents/web/vinimay/build/client/build/2.main.js.map