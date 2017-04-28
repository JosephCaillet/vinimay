"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
const b = require("boom");
const users_1 = require("../models/users");
const friends_1 = require("../models/friends");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const vinimayError_1 = require("../utils/vinimayError");
const comments = require("./comment");
const reactions = require("./reaction");
const utils = require("../utils/serverUtils");
const postUtils = require("../utils/postUtils");
const username_1 = require("../utils/username");
// TODO: Retrieve posts from friends too
function get(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    let options = getOptions(request.query);
    // We cast directly as post, so we don't need getters and setters
    options.raw = true;
    instance.model('post').findAll(options).then((posts) => {
        instance.model('user').findOne().then(async (user) => {
            for (let i in posts) {
                let post = posts[i];
                let author = new users_1.User(username_1.username, user.get('url'));
                post.author = author.toString();
                try {
                    post.comments = await comments.count(post.creationTs);
                    post.reactions = await reactions.count(post.creationTs);
                }
                catch (e) {
                    return reply(b.wrap(e));
                }
            }
            instance.model('friend').findAll({ where: {
                    $or: [
                        { status: friends_1.Status[friends_1.Status.accepted] },
                        { status: friends_1.Status[friends_1.Status.following] }
                    ]
                } }).then((friends) => {
                for (let i in friends) {
                    let friend = new users_1.User(friends[i].get('username'), friends[i].get('url'));
                    postUtils.retrieveRemotePosts(friend, friends[i].get('id_token'), friends[i].get('id_token'))
                        .then();
                }
                reply({
                    authenticated: true,
                    posts: posts
                });
            }).catch(reply);
        }).catch(reply);
    }).catch(reply);
}
exports.get = get;
async function getSingle(request, reply) {
    let instance;
    try {
        let user = await utils.getUser(username_1.username);
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    }
    catch (e) {
        return reply(b.wrap(e));
    }
    instance.model('post').findById(request.params.timestamp).then((res) => {
        if (!res)
            return reply(b.notFound());
        let post = res.get({ plain: true });
        instance.model('user').findOne().then(async (user) => {
            let author = new users_1.User(username_1.username, user.get('url'));
            post.author = author.toString();
            try {
                post.comments = await comments.count(post.creationTs);
                post.reactions = await reactions.count(post.creationTs);
            }
            catch (e) {
                return reply(b.wrap(e));
            }
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
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    instance.model('post').create(post).then((res) => {
        let created = res.get({ plain: true });
        instance.model('user').findOne().then((user) => {
            created.author = new users_1.User(username_1.username, user.get('url')).toString();
            reply(created).code(200);
        }).catch(reply);
    }).catch(reply);
}
exports.create = create;
async function del(request, reply) {
    let instance;
    let user;
    try {
        user = await utils.getUser(username_1.username);
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(user.username);
    }
    catch (e) {
        // If the user doesn't exist, we return an error
        return reply(b.badRequest(e));
    }
    instance.model('user').findOne().then((res) => {
        // Check if instance domain matches
        if (res.get('url').localeCompare(user.instance)) {
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
        let res;
        try {
            res = await postUtils.processPost(posts, request, username);
        }
        catch (e) {
            if (e instanceof vinimayError_1.VinimayError) {
                return reply(b.unauthorized(e.message));
            }
            return reply(b.wrap(e));
        }
        if (res)
            return reply(res);
        else
            return reply(b.unauthorized());
    }).catch(reply);
}
exports.serverGet = serverGet;
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
        let res;
        try {
            res = await postUtils.processPost(post, request, username);
        }
        catch (e) {
            if (e instanceof vinimayError_1.VinimayError) {
                return reply(b.unauthorized(e.message));
            }
            return reply(b.wrap(e));
        }
        if (res)
            return reply(res);
        else
            reply(b.unauthorized());
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
    // Set the order
    options.order = [['creationTs', 'DESC']];
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
