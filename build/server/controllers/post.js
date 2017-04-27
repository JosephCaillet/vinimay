"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
const b = require("boom");
const users_1 = require("../models/users");
const posts_1 = require("../models/posts");
const friends_1 = require("../models/friends");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const utils = require("../utils/serverUtils");
const username = 'alice'; // TEMPORARY
//const friend = 'francis@localhost:3005';
const friend = 'bob@localhost:3001';
// TODO: Retrieve posts from friends too
function get(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    let options = getOptions(request.query);
    // We cast directly as post, so we don't need getters and setters
    options.raw = true;
    instance.model('post').findAll(options).then((posts) => {
        instance.model('user').findOne().then(async (user) => {
            for (let i in posts) {
                let post = posts[i];
                let author = new users_1.User(username, user.get('url'));
                post.author = author.toString();
            }
            reply(posts);
        }).catch(reply);
    }).catch(reply);
}
exports.get = get;
function getSingle(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    let user = new users_1.User(request.params.user);
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(user[0]);
    }
    catch (e) {
        // If the user doesn't exist, we return an error
        return reply(b.badRequest(e));
    }
    instance.model('post').findById(request.params.timestamp).then((res) => {
        let post = res.get({ plain: true });
        instance.model('user').findOne().then((user) => {
            let author = new users_1.User(username, user.get('url'));
            post.author = author.toString();
            reply(post);
        }).catch(reply);
    }).catch(reply);
}
exports.getSingle = getSingle;
function create(request, reply) {
    // Javascript's timestamp is in miliseconds. We want it in seconds.
    let ts = (new Date()).getTime();
    let post = {
        creationTs: ts,
        lastModificationTs: ts,
        content: request.payload.content,
        privacy: request.payload.privacy,
        comments: 0,
        reactions: 0
    };
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    instance.model('post').create(post).then((res) => {
        let created = res.get({ plain: true });
        instance.model('user').findOne().then((user) => {
            created.author = username + '@' + user.get('url');
            reply(created).code(200);
        }).catch(reply);
    }).catch(reply);
}
exports.create = create;
function del(request, reply) {
    let user = new users_1.User(request.params.user);
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(user.username);
    }
    catch (e) {
        // If the user doesn't exist, we return an error
        return reply(b.badRequest(e));
    }
    instance.model('user').findOne().then((res) => {
        // Check if instance domain matches
        if (res.get('url').localeCompare(user[1])) {
            return reply(b.unauthorized());
        }
        // Run the query
        instance.model('post').destroy({ where: {
                creationTs: request.params.timestamp
            } }).then(() => {
            reply(null).code(204);
        }).catch(reply);
    }).catch(reply);
}
exports.del = del;
function serverGet(request, reply) {
    let username = utils.getUsername(request);
    let instance;
    // Check if the user exists (the wrapper will return an error if not)
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    }
    catch (e) {
        return reply(b.notFound(e));
    }
    let options = getOptions(request.query);
    // We cast directly as post, so we don't need getters and setters
    options.raw = true;
    instance.model('post').findAll(options).then(async (posts) => {
        if (request.query.idToken) {
            instance.model('friend').findOne({
                where: { id_token: request.query.idToken }
            }).then(async (friendInstance) => {
                if (!friendInstance)
                    return reply(b.unauthorized('UNKNOWN_TOKEN'));
                let user = (await utils.getUser(username)).toString();
                let url = user + request.path;
                let token = friendInstance.get('signature_token');
                let signature = utils.computeSignature(request.method, url, request.query, token);
                if (!utils.checkSignature(request.query.signature, signature)) {
                    return reply(b.badRequest('WRONG_SIGNATURE'));
                }
                let res = new Array();
                for (let i in posts) {
                    let post = posts[i];
                    post.author = user.toString();
                    let friend = new users_1.User(friendInstance.get('username'), friendInstance.get('url'));
                    if (await canReadPost(username, posts_1.Privacy[post.privacy], friend))
                        res.push(post);
                }
                reply(res);
            }).catch(reply);
        }
        else {
            let res = new Array();
            for (let i in posts) {
                let post = posts[i];
                let author;
                try {
                    post.author = (await utils.getUser(username)).toString();
                }
                catch (e) {
                    return reply(b.wrap(e));
                }
                if (await canReadPost(username, posts_1.Privacy[post.privacy]))
                    res.push(post);
            }
            reply(res);
        }
    }).catch(reply);
}
exports.serverGet = serverGet;
// TODO: This function is really similar to serverGet: Factorise it
function serverGetSingle(request, reply) {
    let username = utils.getUsername(request);
    let instance;
    // Check if the user exists (the wrapper will return an error if not)
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    }
    catch (e) {
        return reply(b.notFound(e));
    }
    instance.model('post').findById(request.params.timestamp, {
        raw: true
    }).then(async (post) => {
        if (request.query.idToken) {
            instance.model('friend').findOne({
                where: { id_token: request.query.idToken }
            }).then(async (friendInstance) => {
                if (!friendInstance)
                    return reply(b.unauthorized('UNKNOWN_TOKEN'));
                let user = (await utils.getUser(username)).toString();
                let url = user + request.path;
                let token = friendInstance.get('signature_token');
                let params = utils.mergeObjects(request.query, request.params);
                let signature = utils.computeSignature(request.method, url, params, token);
                if (!utils.checkSignature(request.query.signature, signature)) {
                    return reply(b.badRequest('WRONG_SIGNATURE'));
                }
                post.author = user.toString();
                let friend = new users_1.User(friendInstance.get('username'), friendInstance.get('url'));
                if (await canReadPost(username, posts_1.Privacy[post.privacy], friend)) {
                    return reply(post);
                }
                else {
                    return reply(b.unauthorized());
                }
            }).catch(reply);
        }
        else {
            let author;
            try {
                post.author = (await utils.getUser(username)).toString();
            }
            catch (e) {
                return reply(b.wrap(e));
            }
            if (await canReadPost(username, posts_1.Privacy[post.privacy])) {
                return reply(post);
            }
            else {
                reply(b.unauthorized());
            }
        }
    }).catch(reply);
}
exports.serverGetSingle = serverGetSingle;
exports.postSchema = j.object({
    "creationTs": j.number().min(1).required().description('Post creation timestamp'),
    "lastEditTs": j.number().min(1).required().description('Last modification timestamp (equals to the creation timestamp if the post has never been edited)'),
    "author": j.string().email().required().description('Post author (using the `username@instance-domain.tld` format)'),
    "content": j.string().required().description('Post content'),
    "privacy": j.string().valid('public', 'private', 'friends').required().description('Post privacy setting (private, friends or public)'),
    "comments": j.number().min(0).required().description('Number of comments on the post'),
    "reactions": j.number().min(0).required().description('Numer of reactions on the post')
}).label('Post');
exports.responseSchema = j.object({
    "authenticated": j.bool().required().description('Boolean indicating whether the user is authenticated'),
    "posts": j.array().items(exports.postSchema).required().label('Posts array')
}).label('Posts response');
function getOptions(queryParams) {
    let options = {};
    // Apply filters
    if (queryParams.start)
        options.offset = queryParams.start;
    if (queryParams.nb)
        options.limit = queryParams.nb;
    // Filter by timestamp require a WHERE clause
    if (queryParams.from || queryParams.to) {
        let timestamp = {};
        if (queryParams.from)
            timestamp['$lte'] = queryParams.from;
        if (queryParams.to)
            timestamp['$gte'] = queryParams.to;
        options.where = { creationTs: timestamp };
    }
    return options;
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
