"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const crypto = require("crypto");
const Boom = require("boom");
const request = require("request-promise-native");
const commons = require("./commons");
const sequelizeWrapper_1 = require("./sequelizeWrapper");
const friends_1 = require("../models/friends");
const log = require('printit')({
    prefix: 'Utils:Friends',
    date: true
});
function getAll(user, username) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    return new Promise((resolve, reject) => {
        instance.model('friend').findOne({ where: {
                username: user.username,
                url: user.instance
            } }).then((friend) => resolve(friend)).catch(reject);
    });
}
exports.getAll = getAll;
function create(status, user, username, token) {
    log.debug('Creating row for', user.toString(), 'with status', friends_1.Status[status]);
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    return new Promise((resolve, reject) => {
        let description = null;
        getAll(user, username).then((friend) => {
            if (friend) {
                log.debug('Friend exists, upgrading it');
                return upgrade(friend, status);
            }
            return getRemoteUserData(user);
        }).then((userData) => {
            // Check if we resolved from save() or getRemoteUserData()
            if (!userData.upgraded) {
                description = userData.description;
                return profileExists(user, username).then((exists) => {
                    if (exists)
                        return Promise.resolve(true);
                    log.debug('Creating the profile');
                    return instance.model('profile').create({
                        username: userData.username,
                        url: userData.url,
                        description: userData.description
                    });
                });
            }
            else {
                log.debug('Skipping creation');
                // If we only have to update the user in DB, return without
                // doing anything else
                return Promise.resolve();
            }
        }).then((created) => {
            if (created) {
                let friend = {
                    username: user.username,
                    url: user.instance,
                    status: friends_1.Status[status]
                };
                if (token)
                    friend.id_token = token;
                log.debug('Creating the friend');
                return instance.model('friend').create(friend);
            }
            else {
                log.debug('Skipping creation');
                return Promise.resolve();
            }
        }).then(() => resolve(description)).catch(reject);
    });
}
exports.create = create;
;
function upgrade(user, newStatus) {
    return new Promise((resolve, reject) => {
        let friendStatus = friends_1.Status[user.get('status')];
        // If a friend exist, we check its status. We throw a conflict
        // error if its already at the status we want to set it to,
        // or if its status is "friend". Else we upgrade it to the given
        // status.
        if (newStatus === friendStatus
            || friendStatus === friends_1.Status.accepted
            || friendStatus === friends_1.Status.pending) {
            log.debug('Friend already exists with status', friends_1.Status[friendStatus] + ',', 'aborting without creating nor updating');
            throw Boom.conflict();
        }
        user.set('status', friends_1.Status[newStatus]);
        user.save().then((user) => {
            // Wrap the result so we can know it came from this function
            resolve({
                upgraded: true,
                instance: user
            });
        });
    });
}
exports.upgrade = upgrade;
function profileExists(user, username) {
    return new Promise((resolve, reject) => {
        let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
        instance.model('profile').count({ where: {
                username: user.username,
                url: user.instance
            } }).then((count) => resolve(!!count)).catch(reject);
    });
}
exports.profileExists = profileExists;
function befriend(user, currentUser) {
    return new Promise((resolve, reject) => {
        let url = path.join(user.toString(), '/v1/server/friends');
        let protocol;
        if (commons.settings.forceHttp || url.indexOf('localhost') > -1)
            protocol = 'http://';
        else
            protocol = 'https://';
        url = protocol + url;
        // token is a 64-byte long alphanumeric string (so 32-byte long in hexa)
        let token = crypto.randomBytes(32).toString('hex');
        let description = null;
        // Store the request on our side
        return create(friends_1.Status.pending, user, currentUser.username, token)
            .then((desc) => {
            description = desc;
            log.debug('User description is', description);
            return request({
                method: 'POST',
                uri: url,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    from: currentUser.toString(),
                    tempToken: token
                },
                json: true,
                timeout: commons.settings.timeout
            });
        }).then(() => resolve(description)).catch(reject);
    });
}
exports.befriend = befriend;
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
