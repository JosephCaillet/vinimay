"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const crypto = require("crypto");
const Boom = require("boom");
const request = require("request-promise-native");
const commons = require("./commons");
const utils = require("./serverUtils");
const sequelizeWrapper_1 = require("./sequelizeWrapper");
const friends_1 = require("../models/friends");
const users_1 = require("../models/users");
const log = require('printit')({
    prefix: 'Utils:Friends',
    date: true
});
const acceptations = {};
function getFriend(user, username) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    return new Promise((resolve, reject) => {
        instance.model('friend').findOne({ where: {
                username: user.username,
                url: user.instance
            } }).then((friend) => resolve(friend)).catch(reject);
    });
}
exports.getFriend = getFriend;
function create(status, user, username, token) {
    log.debug('Creating row for', user.toString(), 'with status', friends_1.Status[status]);
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    return new Promise((resolve, reject) => {
        let description = null;
        utils.getUser(username).then((current) => {
            if (current.username === user.username && current.instance === user.instance) {
                log.debug('User is trying to follow/befriend itself');
                throw Boom.forbidden();
            }
            return getFriend(user, username);
        }).then((friend) => {
            if (friend) {
                log.debug('Friend exists, upgrading it');
                if (token)
                    log.debug('Using token', token, 'for upgrade');
                return upgrade(friend, status, false, token);
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
                if (token) {
                    log.debug('Creating the friend request with token', token);
                    friend.id_token = token;
                }
                else {
                    log.debug('Creating a row with no token');
                }
                return instance.model('friend').create(friend);
            }
            else {
                log.debug('Skipping creation');
                return Promise.resolve();
            }
        }).then((friend) => {
            if (friend)
                log.debug('Friend request created with token', friend.get('id_token'));
            return resolve(description);
        }).catch(reject);
    });
}
exports.create = create;
;
function upgrade(user, newStatus, force, token) {
    return new Promise((resolve, reject) => {
        let friendStatus = friends_1.Status[user.get('status')];
        // If a friend exist, we check its status. We throw a conflict
        // error if its already at the status we want to set it to,
        // or if its status is "friend". Else we upgrade it to the given
        // status. We can also force the upgrade (for example if we want to move
        // a "pending" friend request to "accepted").
        if ((newStatus === friendStatus
            || friendStatus === friends_1.Status.accepted
            || friendStatus === friends_1.Status.pending) && !force) {
            log.debug('Friend already exists with status', friends_1.Status[friendStatus] + ',', 'aborting without creating nor updating');
            throw Boom.conflict();
        }
        user.set('status', friends_1.Status[newStatus]);
        if (token)
            user.set('id_token', token);
        user.save().then((user) => {
            let friend = new users_1.User(user.get('username'), user.get('url'));
            log.debug('Upgraded', friend.toString(), 'with status', user.get('status'), 'and', user.get('id_token') || 'nothing', 'as token');
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
exports.getRemoteUserData = getRemoteUserData;
async function acceptFriendRequest(user, username) {
    let friend = await getFriend(user, username);
    let tempToken = friend.get('id_token');
    if (acceptations[tempToken])
        throw Boom.conflict();
    acceptations[tempToken] = {};
    let acceptation = acceptations[tempToken];
    return new Promise((resolve, reject) => {
        log.debug('Accepting friend request from', user.toString());
        acceptation.idDH = crypto.createDiffieHellman(256);
        acceptation.sigDH = crypto.createDiffieHellman(256);
        let id = {
            generator: acceptation.idDH.getGenerator('hex'),
            prime: acceptation.idDH.getPrime('hex'),
            mod: acceptation.idDH.generateKeys('hex')
        };
        let sig = {
            generator: acceptation.sigDH.getGenerator('hex'),
            prime: acceptation.sigDH.getPrime('hex'),
            mod: acceptation.sigDH.generateKeys('hex')
        };
        let protocol;
        let url = path.join(user.toString(), '/v1/server/friends');
        if (commons.settings.forceHttp || url.indexOf('localhost') > -1)
            protocol = 'http://';
        else
            protocol = 'https://';
        let friendInstance;
        getFriend(user, username).then((friend) => {
            friendInstance = friend;
            if (!friendInstance || friends_1.Status[friendInstance.get('status')] !== friends_1.Status.incoming) {
                log.debug('Friend request does not exist');
                delete acceptations[acceptation.tempToken];
                throw Boom.notFound();
            }
            acceptation.tempToken = friendInstance.get('id_token');
            let body = {
                step: 1,
                tempToken: acceptation.tempToken,
                idTokenDh: id,
                sigTokenDh: sig,
            };
            log.debug('Sending step 1');
            return request({
                method: 'PUT',
                url: protocol + url,
                body: body,
                json: true,
                headers: { 'Content-Type': 'application/json' },
                timeout: commons.settings.timeout
            });
        }).then((keys) => {
            log.debug('Got keys from', user.toString());
            try {
                acceptation.idToken = acceptation.idDH.computeSecret(keys.idTokenMod, 'hex', 'hex');
                acceptation.sigToken = acceptation.sigDH.computeSecret(keys.sigTokenMod, 'hex', 'hex');
            }
            catch (e) {
                delete acceptations[acceptation.tempToken];
                return reject(e);
            }
            log.debug('Computed idToken', acceptation.idToken, 'for', user.toString());
            log.debug('Computed signature token', acceptation.sigToken, 'for', user.toString());
            let body = {
                step: 2,
                tempToken: acceptation.tempToken,
                idToken: acceptation.idToken
            };
            body.signature = utils.computeSignature('PUT', url, body, acceptation.sigToken);
            return request({
                method: 'PUT',
                url: protocol + url,
                body: body,
                json: true,
                headers: { 'Content-Type': 'application/json' },
                timeout: commons.settings.timeout
            });
        }).then(() => {
            return upgrade(friendInstance, friends_1.Status.accepted, true);
        }).then((upgraded) => {
            // Update the tokens
            let friendInstance = upgraded.instance;
            friendInstance.set('id_token', acceptation.idToken);
            friendInstance.set('signature_token', acceptation.sigToken);
            return friendInstance.save();
        }).then((updated) => {
            delete acceptations[acceptation.tempToken];
            return resolve();
        }).catch(e => {
            delete acceptations[acceptation.tempToken];
            return reject(e);
        });
    });
}
exports.acceptFriendRequest = acceptFriendRequest;
function handleStepOne(username, payload) {
    return new Promise(async (resolve, reject) => {
        let friendInstance;
        try {
            friendInstance = await utils.getFriendByToken(username, payload.tempToken);
        }
        catch (e) {
            log.warn('Could not retrieve friend for token', payload.tempToken);
            return reject(e);
        }
        let friend = new users_1.User(friendInstance.username, friendInstance.url);
        if (acceptations[payload.tempToken]) {
            delete acceptations[payload.tempToken];
            return reject(Boom.conflict());
        }
        log.debug('Received acceptation data (step 1) from', friend.toString());
        acceptations[payload.tempToken] = {};
        let acceptation = acceptations[payload.tempToken];
        acceptation.tempToken = payload.tempToken;
        try {
            acceptation.idDH = crypto.createDiffieHellman(payload.idTokenDh.prime, 'hex', payload.idTokenDh.generator, 'hex');
            acceptation.sigDH = crypto.createDiffieHellman(payload.sigTokenDh.prime, 'hex', payload.sigTokenDh.generator, 'hex');
            acceptation.idDH.generateKeys();
            acceptation.sigDH.generateKeys();
            acceptation.idToken = acceptation.idDH.computeSecret(payload.idTokenDh.mod, 'hex', 'hex');
            acceptation.sigToken = acceptation.sigDH.computeSecret(payload.sigTokenDh.mod, 'hex', 'hex');
        }
        catch (e) {
            delete acceptations[acceptation.tempToken];
            return reject(e);
        }
        log.debug('Computed idToken', acceptation.idToken, 'for', friend.toString());
        log.debug('Computed signature token', acceptation.sigToken, 'for', friend.toString());
        resolve({
            idTokenMod: acceptation.idDH.generateKeys('hex'),
            sigTokenMod: acceptation.sigDH.generateKeys('hex')
        });
    });
}
exports.handleStepOne = handleStepOne;
function handleStepTwo(user, payload) {
    return new Promise(async (resolve, reject) => {
        let friendInstance;
        try {
            friendInstance = await utils.getFriendByToken(user.username, payload.tempToken);
        }
        catch (e) {
            log.warn('Could not retrieve friend for token', payload.tempToken);
            return reject(e);
        }
        let friend = new users_1.User(friendInstance.username, friendInstance.url);
        if (!acceptations[payload.tempToken]) {
            log.warn('Could not find previously in-memory stored data on the ongoing acceptation');
            throw Boom.notFound();
        }
        log.debug('Received acceptation data (step 2) from', friend.toString());
        let acceptation = acceptations[payload.tempToken];
        // Check idToken
        if (payload.idToken !== acceptation.idToken) {
            log.warn('idToken did not match');
            delete acceptations[acceptation.tempToken];
            return reject(Boom.expectationFailed('idToken not matching', { field: 'idToken' }));
        }
        // Check signature
        let params = Object.assign({}, payload);
        let signature = payload.signature;
        delete params.signature;
        let url = path.join(user.toString(), '/v1/server/friends');
        let computedSignature = utils.computeSignature('PUT', url, params, acceptation.sigToken);
        if (computedSignature !== signature) {
            log.warn('Signature did not match');
            delete acceptations[acceptation.tempToken];
            return reject(Boom.expectationFailed('Signature not matching', { field: 'signature' }));
        }
        log.debug('All data matching, updating the friend request from', friend.toString(), '(tempToken = ', acceptation.tempToken + ')');
        sequelizeWrapper_1.SequelizeWrapper.getInstance(user.username).model('friend').findOne({ where: {
                id_token: acceptation.tempToken
            } }).then((friendInstance) => {
            // Update the status
            return upgrade(friendInstance, friends_1.Status.accepted, true);
        }).then((upgraded) => {
            // Update the tokens
            let friendInstance = upgraded.instance;
            friendInstance.set('id_token', acceptation.idToken);
            friendInstance.set('signature_token', acceptation.sigToken);
            return friendInstance.save();
        }).then((updated) => {
            delete acceptations[acceptation.tempToken];
            return resolve();
        }).catch(e => {
            delete acceptations[acceptation.tempToken];
            return reject(e);
        });
    });
}
exports.handleStepTwo = handleStepTwo;
