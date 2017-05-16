"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Boom = require("boom");
const request = require("request-promise-native");
const commons = require("./commons");
const sequelizeWrapper_1 = require("./sequelizeWrapper");
const friends_1 = require("../models/friends");
function exists(user, username) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    return new Promise((resolve, reject) => {
        instance.model('friend').count({ where: {
                username: user.username,
                url: user.instance
            } }).then((count) => resolve(!!count)).catch(reject);
    });
}
exports.exists = exists;
function create(status, user, username, token) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    return new Promise((resolve, reject) => {
        exists(user, username).then((exists) => {
            if (exists)
                throw Boom.conflict();
            return getRemoteUserData(user);
        }).then((user) => {
            return instance.model('profile').create({
                username: user.username,
                url: user.url,
                description: user.description
            });
        }).then(() => {
            let friend = {
                username: user.username,
                url: user.instance,
                status: friends_1.Status[status]
            };
            if (token)
                friend.id_token = token;
            return instance.model('friend').create(friend);
        }).then(() => {
            resolve();
        }).catch(reject);
    });
}
exports.create = create;
function getRemoteUserData(user) {
    let url = path.join(user.instance, '/v1/client/me');
    let protocol;
    if (commons.settings.forceHttp || url.indexOf('localhost') > -1)
        protocol = 'http://';
    else
        protocol = 'https://';
    url = protocol + url;
    return request.get(url, {
        json: true,
        timeout: commons.settings.timeout
    });
}
