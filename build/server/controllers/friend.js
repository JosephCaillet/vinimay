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
function create(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    let user = new users_1.User(request.payload.to);
    let type = Type[request.payload.type];
    switch (type) {
        case Type.following:
            clientLog.debug('Following', user.toString());
            friendUtils.create(friends_1.Status.following, user, username_1.username)
                .then(() => reply(null).code(204)).catch((e) => {
                if (e.isBoom)
                    return reply(e);
                return reply(Boom.wrap(e));
            });
            break;
        case Type.friend:
            clientLog.debug('Asking', user.toString(), 'to be our friend');
            break;
        default:
            reply(Boom.badRequest());
    }
}
exports.create = create;
function saveFriendRequest(request, reply) {
    let username = utils.getUsername(request);
    let from = new users_1.User(request.payload.from);
    let instance;
    // Check if the user exists (the wrapper will return an error if not)
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    }
    catch (e) {
        serverLog.debug('Couldn\'t find local user');
        return reply(Boom.notFound(e));
    }
    friendUtils.create(friends_1.Status.incoming, from, username)
        .then(() => reply(null).code(200))
        .catch((e) => {
        if (e.isBoom)
            return reply(e);
        return reply(Boom.wrap(e));
    });
}
exports.saveFriendRequest = saveFriendRequest;
exports.friendSchema = Joi.object({
    user: Joi.string().required().description('User (formatted as `username@instance-domain.tld`)'),
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
