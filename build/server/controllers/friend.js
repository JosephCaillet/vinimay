"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
// Import the models
const friends_1 = require("../models/friends");
// Import the DB wrapper
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username = 'alice'; // TEMPORARY
function get(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
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
            let username = user.get('username') + '@' + user.get('url');
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
        reply(e);
    });
}
exports.get = get;
exports.friendSchema = j.object({
    user: j.string().required().description('User (formatted as `username@instance-domain.tld`)'),
    description: j.string().description('User description')
}).label('Friend');
exports.friendSentSchema = j.object({
    user: j.string().required().description('User (formatted as `username@instance-domain.tld`)'),
    status: j.string().required().valid('pending', 'declined').description('Request status (pending or refused)')
}).label('FriendSent');
exports.friendsSchema = j.object({
    accepted: j.array().required().items(exports.friendSchema).label('FriendsAccepted').description('Accepted friend requests'),
    incoming: j.array().required().items(exports.friendSchema).label('FriendsReceived').description('Incoming friend requests'),
    sent: j.array().required().items(exports.friendSentSchema).label('FriendsSent').description('Sent (pending) friend requests'),
    following: j.array().required().items(exports.friendSchema).label('FriendsFollowings').description('People followed by the user'),
}).label('Friends');
