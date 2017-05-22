"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const Boom = require("boom");
// Import the models
const friends_1 = require("../models/friends");
const users_1 = require("../models/users");
// Import the DB wrapper
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username_1 = require("../utils/username");
const commons = require("../utils/commons");
const utils = require("../utils/serverUtils");
const friendUtils = require("../utils/friendUtils");
const printit = require('printit');
const clientLog = printit({
    prefix: 'Client:Friends',
    date: true
});
const serverLog = printit({
    prefix: 'Server:Friends',
    date: true
});
var Type;
(function (Type) {
    Type[Type["friend"] = 0] = "friend";
    Type[Type["following"] = 1] = "following";
})(Type = exports.Type || (exports.Type = {}));
function get(request, reply) {
    clientLog.debug('Getting list of friends');
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    instance.model('friend').findAll({
        include: [{
                model: instance.model('profile'),
                attributes: ['description']
            }]
    }).then((users) => {
        let response = new friends_1.Response();
        for (let i in users) {
            let user = users[i];
            let status = user.get('status');
            let username = new users_1.User(user.get('username'), user.get('url')).toString();
            // Ugly index so TypeScript doesn't yell at us
            let description = user['profile'].get('description');
            // If a friend request isn't of one of these 5 values, it will
            // be ignored
            switch (friends_1.Status[status]) {
                case friends_1.Status.accepted:
                    response.addAccepted(new friends_1.Friend(username, description));
                    break;
                case friends_1.Status.following:
                    response.addFollowing(new friends_1.Friend(username, description));
                    break;
                case friends_1.Status.incoming:
                    response.addIncoming(new friends_1.Friend(username, description));
                    break;
                case friends_1.Status.pending:
                case friends_1.Status.declined:
                    response.addSent(new friends_1.OutgoingRequests(username, status));
                    break;
            }
        }
        reply(response);
    }).catch((e) => {
        reply(Boom.wrap(e));
    });
}
exports.get = get;
async function create(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    let user = new users_1.User(request.payload.to);
    let type = Type[request.payload.type];
    switch (type) {
        case Type.following:
            clientLog.debug('Following', user.toString());
            friendUtils.create(friends_1.Status.following, user, username_1.username)
                .then((description) => {
                let res = {
                    user: user.toString()
                };
                if (description)
                    res.description = description;
                return commons.checkAndSendSchema(res, exports.friendSchema, clientLog, reply);
            }).catch((e) => {
                if (e.isBoom)
                    return reply(e);
                return utils.handleRequestError(user, e, clientLog, false, reply);
            });
            break;
        case Type.friend:
            clientLog.debug('Asking', user.toString(), 'to be our friend');
            utils.getUser(username_1.username).then((current) => {
                if (!current)
                    throw Boom.notFound();
                return friendUtils.befriend(user, current);
            }).then((description) => {
                let res = {
                    user: user.toString()
                };
                if (description)
                    res.description = description;
                return commons.checkAndSendSchema(res, exports.friendSchema, clientLog, reply);
            }).catch((e) => {
                if (e.isBoom)
                    return reply(e);
                return utils.handleRequestError(user, e, clientLog, false, reply);
            });
            break;
        default:
            reply(Boom.badRequest());
    }
}
exports.create = create;
function updateRequest(request, reply) {
    let friend = new users_1.User(request.params.user);
    if (request.payload.accepted) {
        clientLog.debug('Accepting friend request from', friend.toString());
        friendUtils.acceptFriendRequest(friend, username_1.username)
            .then(() => reply(null).code(204)).catch((e) => {
            if (e.isBoom)
                return reply(e);
            else
                return utils.handleRequestError(friend, e, clientLog, false, reply);
        });
    }
    else if (!request.payload.accepted && typeof request.payload.accepted === 'boolean') {
        friendUtils.declineFriendRequest(friend, username_1.username)
            .then(() => reply(null).code(204)).catch((e) => {
            if (e.isBoom)
                return reply(e);
            else
                return utils.handleRequestError(friend, e, clientLog, false, reply);
        });
    }
    else {
        return reply(Boom.badRequest());
    }
}
exports.updateRequest = updateRequest;
async function accept(request, reply) {
    let username = utils.getUsername(request);
    let user = await utils.getUser(username);
    let friendInstance;
    try {
        friendInstance = await utils.getFriendByToken(username, request.payload.tempToken);
    }
    catch (e) {
        serverLog.warn('Could not retrieve friend for token', request.payload.tempToken);
        return reply(Boom.notFound());
    }
    let friend = new users_1.User(friendInstance.username, friendInstance.url);
    switch (request.payload.step) {
        case 1:
            friendUtils.handleStepOne(username, request.payload)
                .then((mods) => commons.checkAndSendSchema(mods, exports.modsSchema, serverLog, reply))
                .catch((e) => {
                if (e.isBoom)
                    return reply(e);
                else
                    return reply(Boom.wrap(e));
            });
            break;
        case 2:
            friendUtils.handleStepTwo(user, request.payload)
                .then(() => reply(null).code(204))
                .catch((e) => {
                if (e.isBoom)
                    return reply(e);
                else
                    return reply(Boom.wrap(e));
            });
            break;
    }
}
exports.accept = accept;
function decline(request, reply) {
    let username = utils.getUsername(request);
    sequelizeWrapper_1.SequelizeWrapper.getInstance(username).model('friend').findOne({ where: {
            id_token: request.payload.token
        } }).then((friend) => {
        let statuses = [
            friends_1.Status[friends_1.Status.pending],
            friends_1.Status[friends_1.Status.incoming],
            friends_1.Status[friends_1.Status.accepted]
        ];
        if (!friend || statuses.indexOf(friend.get('status')) === -1) {
            serverLog.warn('Could not retrieve friend for token', request.payload.token);
            throw Boom.notFound();
        }
        let user = new users_1.User(friend.get('username'), friend.get('url'));
        if (friend.get('status') === friends_1.Status[friends_1.Status.incoming]) {
            serverLog.debug('Removing the friend request from', user.toString());
            return friend.destroy();
        }
        else {
            // If we're cancelling an existing relationship, we have to sign the
            // request
            if (friend.get('status') === friends_1.Status[friends_1.Status.accepted]) {
                if (!request.payload.signature) {
                    serverLog.debug('No signature provided');
                    throw Boom.badRequest();
                }
                let url = username + '@' + request.info.host + request.url.path;
                let signature = utils.computeSignature('DELETE', url, {
                    token: request.payload.token
                }, friend.get('signature_token'));
                if (signature !== request.payload.signature) {
                    serverLog.debug('Signature mismatch');
                    throw Boom.unauthorized('WRONG_SIGNATURE');
                }
            }
            serverLog.debug('Setting friend status to declined and removing tokens');
            friend.set('id_token', null);
            friend.set('signature_token', null);
            friend.set('status', friends_1.Status[friends_1.Status.declined]);
            return friend.save();
        }
    }).then(() => reply(null).code(204))
        .catch((e) => {
        if (e.isBoom)
            return reply(e);
        else
            return reply(Boom.wrap(e));
    });
}
exports.decline = decline;
function saveFriendRequest(request, reply) {
    let username = utils.getUsername(request);
    let from = new users_1.User(request.payload.from);
    let tempToken = request.payload.tempToken;
    serverLog.debug('Got friend request from', from.toString(), 'with tempToken', tempToken);
    let instance;
    // Check if the user exists (the wrapper will return an error if not)
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    }
    catch (e) {
        serverLog.debug('Couldn\'t find local user');
        return reply(Boom.notFound(e));
    }
    friendUtils.create(friends_1.Status.incoming, from, username, tempToken)
        .then((description) => {
        let res = {
            user: from.toString()
        };
        if (description)
            res.description = description;
        return commons.checkAndSendSchema(res, exports.friendSchema, serverLog, reply);
    })
        .catch((e) => {
        if (e.isBoom)
            return reply(e);
        return reply(Boom.wrap(e));
    });
}
exports.saveFriendRequest = saveFriendRequest;
exports.friendSchema = Joi.object({
    user: commons.user.required().description('User (formatted as `username@instance-domain.tld`)'),
    description: Joi.string().description('User description')
}).label('Friend');
exports.friendSentSchema = Joi.object({
    user: Joi.string().required().description('User (formatted as `username@instance-domain.tld`)'),
    status: Joi.string().required().valid('pending', 'declined').description('Request status (pending or refused)')
}).label('FriendSent');
exports.friendsSchema = Joi.object({
    accepted: Joi.array().required().items(exports.friendSchema).label('FriendsAccepted').description('Accepted friend requests'),
    incoming: Joi.array().required().items(exports.friendSchema).label('FriendsReceived').description('Incoming friend requests'),
    sent: Joi.array().required().items(exports.friendSentSchema).label('FriendsSent').description('Sent (pending) friend requests'),
    following: Joi.array().required().items(exports.friendSchema).label('FriendsFollowings').description('People followed by the user'),
}).label('Friends');
exports.acceptationSchema = Joi.object({
    step: Joi.number().valid(1, 2).required().description('The identifier of the step'),
    tempToken: Joi.string().alphanum().required().description('The temporary token used during the transaction'),
    idTokenDh: Joi.object({
        generator: Joi.string().alphanum().required().description('The Diffie-Hellman generator'),
        prime: Joi.string().alphanum().required().description('The Diffie-Hellman prime number'),
        mod: Joi.string().alphanum().required().description('The Diffie-Hellman modulo')
    }).when('step', { is: 1, then: Joi.required(), otherwise: Joi.forbidden() }).label('idToken DH').description('Diffie-Hellman for the idToken'),
    sigTokenDh: Joi.object({
        generator: Joi.string().alphanum().required().description('The Diffie-Hellman generator'),
        prime: Joi.string().alphanum().required().description('The Diffie-Hellman prime number'),
        mod: Joi.string().alphanum().required().description('The Diffie-Hellman modulo')
    }).when('step', { is: 1, then: Joi.required(), otherwise: Joi.forbidden() }).label('idToken DH').description('Diffie-Hellman for the signature token'),
    idToken: Joi.string().alphanum().when('step', { is: 2, then: Joi.required(), otherwise: Joi.forbidden() }).description('The computed idToken'),
    signature: Joi.string().alphanum().when('step', { is: 2, then: Joi.required(), otherwise: Joi.forbidden() }).description('The signature computed with the computed signature token')
}).label('Friend acceptation');
exports.modsSchema = Joi.object({
    idTokenMod: Joi.string().alphanum().required().description('Key for idToken'),
    sigTokenMod: Joi.string().alphanum().required().description('Key for signature token')
});
