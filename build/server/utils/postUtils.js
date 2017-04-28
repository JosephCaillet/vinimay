"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("./serverUtils");
const sequelizeWrapper_1 = require("./sequelizeWrapper");
const users_1 = require("../models/users");
const posts_1 = require("../models/posts");
const friends_1 = require("../models/friends");
const vinimayError_1 = require("./vinimayError");
function processPost(arg, request, username) {
    return new Promise(async (ok, ko) => {
        let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
        let res;
        try {
            if (request.query.idToken) {
                res = await processPostAuth(arg, request, username);
            }
            else {
                res = await processPostAnon(arg, request, username);
            }
        }
        catch (e) {
            ko(e);
        }
        ok(res);
    });
}
exports.processPost = processPost;
function canReadPost(username, privacy, friend) {
    return new Promise((ok, ko) => {
        switch (privacy) {
            case posts_1.Privacy.public:
                return ok(true);
            case posts_1.Privacy.friends:
                if (!friend)
                    return ok(false);
                return isFriend(username, friend).then((isfriend) => {
                    if (isfriend)
                        return ok(true);
                    else
                        return ok(false);
                }).catch(ko);
            default:
                return ok(false);
        }
    });
}
function isFriend(username, friend) {
    return new Promise((ok, ko) => {
        let user;
        if (typeof friend === 'string') {
            user = new users_1.User(friend);
        }
        else {
            user = friend;
        }
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username).model('friend').findOne({
            where: {
                username: user.username,
                url: user.instance
            }
        }).then((friend) => {
            let status = friend.get('status');
            if (friends_1.Status[status] === friends_1.Status.accepted) {
                ok(true);
            }
            ok(false);
        }).catch(ko);
    });
}
function processPostAuth(arg, request, username) {
    return new Promise(async (ok, ko) => {
        let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
        let friendInstance;
        try {
            friendInstance = await instance.model('friend').findOne({ where: {
                    id_token: request.query.idToken,
                    status: friends_1.Status[friends_1.Status.accepted]
                } });
        }
        catch (e) {
            return ko(e);
        }
        if (!friendInstance)
            return ko(new vinimayError_1.VinimayError('UNKNOWN_TOKEN'));
        let user;
        try {
            user = (await utils.getUser(username)).toString();
        }
        catch (e) {
            return ko(e);
        }
        let url = user + request.path;
        let token = friendInstance.get('signature_token');
        let params = utils.mergeObjects(request.query, request.params);
        let signature = utils.computeSignature(request.method, url, params, token);
        if (!utils.checkSignature(request.query.signature, signature)) {
            ko(new vinimayError_1.VinimayError('WRONG_SIGNATURE'));
        }
        let friend = new users_1.User(friendInstance.get('username'), friendInstance.get('url'));
        if (arg instanceof Array) {
            let res = new Array();
            for (let i in arg) {
                let post = arg[i];
                post.author = user.toString();
                if (await canReadPost(username, posts_1.Privacy[post.privacy], friend)) {
                    res.push(post);
                }
            }
            ok(res);
        }
        else {
            let post = arg;
            let author;
            try {
                post.author = (await utils.getUser(username)).toString();
            }
            catch (e) {
                return ko(e);
            }
            try {
                if (await canReadPost(username, posts_1.Privacy[post.privacy]), friend) {
                    ok(post);
                }
                else {
                    ok();
                }
            }
            catch (e) {
                ko(e);
            }
        }
    });
}
function processPostAnon(arg, request, username) {
    return new Promise(async (ok, ko) => {
        if (arg instanceof Array) {
            let res = new Array();
            for (let i in arg) {
                let post = arg[i];
                let author;
                try {
                    post.author = (await utils.getUser(username)).toString();
                }
                catch (e) {
                    return ko(e);
                }
                try {
                    if (await canReadPost(username, posts_1.Privacy[post.privacy])) {
                        res.push(post);
                    }
                }
                catch (e) {
                    ko(e);
                }
            }
            ok(res);
        }
        else {
            let post = arg;
            let author;
            try {
                post.author = (await utils.getUser(username)).toString();
            }
            catch (e) {
                return ko(e);
            }
            try {
                if (await canReadPost(username, posts_1.Privacy[post.privacy])) {
                    ok(post);
                }
                else {
                    ok();
                }
            }
            catch (e) {
                ko(e);
            }
        }
    });
}
function retrieveRemotePosts(source) {
}
