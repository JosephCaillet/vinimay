"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
const b = require("boom");
const users_1 = require("../models/users");
const posts_1 = require("../models/posts");
const friends_1 = require("../models/friends");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const vinimayError_1 = require("../utils/vinimayError");
const comments = require("./comment");
const reactions = require("./reaction");
const commons = require("../utils/commons");
const utils = require("../utils/serverUtils");
const postUtils = require("../utils/postUtils");
const username_1 = require("../utils/username");
const log = require('printit')({
    date: true,
    prefix: 'posts'
});
exports.postSchema = j.object({
    "creationTs": j.number().min(1).required().description('Post creation timestamp'),
    "lastEditTs": j.number().min(1).required().description('Last modification timestamp (equals to the creation timestamp if the post has never been edited)'),
    "author": commons.user.description('Post author (using the `username@instance-domain.tld` format)'),
    "content": j.string().required().description('Post content'),
    "privacy": j.string().valid('public', 'private', 'friends').required().description('Post privacy setting (private, friends or public)'),
    "comments": j.number().min(0).required().description('Number of comments on the post'),
    "reactions": j.number().min(0).required().description('Numer of reactions on the post'),
    "reacted": j.boolean().required().description('Information on whether the current user reacted to the post')
}).label('Post');
exports.postsArray = j.array().items(exports.postSchema).required().label('Posts array');
exports.responseSchema = j.object({
    "authenticated": j.bool().required().description('Boolean indicating whether the user is authenticated'),
    "posts": exports.postsArray,
    "failures": j.array().items(commons.user).required().label('Requests failures')
}).label('Posts response');
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
                    post.reacted = await reactions.reacted(post.creationTs);
                    post.lastEditTs = post.lastModificationTs;
                    delete post.lastModificationTs;
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
                } }).then(async (friends) => {
                let failures = new Array();
                for (let i in friends) {
                    let friend = new users_1.User(friends[i].get('username'), friends[i].get('url'));
                    // We need a copy of the object, and not a referece to it
                    let params = Object.assign({}, request.query);
                    let fPosts;
                    try {
                        fPosts = await postUtils.retrieveRemotePosts(friend, params, friends[i].get('id_token'), friends[i].get('signature_token'));
                    }
                    catch (e) {
                        utils.handleRequestError(friend, e, log, true);
                        failures.push(friend.toString());
                        continue;
                    }
                    for (let j in fPosts) {
                        fPosts[j].author = friend.toString();
                    }
                    posts = posts.concat(fPosts);
                }
                posts.sort((a, b) => b.creationTs - a.creationTs);
                // We'll have more posts than requested, so we truncate the array
                if (request.query.nb)
                    posts = posts.slice(0, request.query.nb);
                let rep = {
                    authenticated: true,
                    posts: posts,
                    failures: failures
                };
                if (failures.length)
                    rep.failures = failures;
                return commons.checkAndSendSchema(rep, exports.responseSchema, log, reply);
            }).catch(e => reply(b.wrap(e)));
        }).catch(e => reply(b.wrap(e)));
    }).catch(e => reply(b.wrap(e)));
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
    let author = new users_1.User(request.params.user);
    instance.model('user').findOne().then((user) => {
        // Check if the post is local or not
        if (!user.get('url').localeCompare(author.instance)) {
            // We don't support multi-user instances yet
            instance.model('post').findById(request.params.timestamp).then(async (res) => {
                if (!res)
                    return reply(b.notFound());
                let post = res.get({ plain: true });
                post.author = author.toString();
                try {
                    post.comments = await comments.count(post.creationTs);
                    post.reactions = await reactions.count(post.creationTs);
                    post.reacted = await reactions.reacted(post.creationTs);
                    post.lastEditTs = post.lastModificationTs;
                    delete post.lastModificationTs;
                }
                catch (e) {
                    return reply(b.wrap(e));
                }
                commons.checkAndSendSchema(post, exports.postSchema, log, reply);
            }).catch(e => reply(b.wrap(e)));
        }
        else {
            instance.model('friend').findOne({ where: {
                    username: author.username,
                    url: author.instance
                } }).then((friend) => {
                let idtoken, sigtoken;
                // Set the token if the post author is known
                // Note: if the author isn't a friend (following doesn't count),
                // tokens will still be null/undefined
                if (friend) {
                    idtoken = friend.get('id_token');
                    sigtoken = friend.get('signature_token');
                }
                // We want to retrieve only one post at a given timestamp
                postUtils.retrieveRemotePost(author, request.params.timestamp, idtoken, sigtoken).then((post) => {
                    return commons.checkAndSendSchema(post, exports.postSchema, log, reply);
                }).catch(e => utils.handleRequestError(author, e, log, false, reply));
            }).catch(e => reply(b.wrap(e)));
        }
    }).catch(e => reply(b.wrap(e)));
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
        reactions: 0,
        reacted: false
    };
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    instance.model('post').create(post).then(async (res) => {
        let created = res.get({ plain: true });
        instance.model('user').findOne().then(async (user) => {
            created.author = new users_1.User(username_1.username, user.get('url')).toString();
            try {
                created.comments = await comments.count(created.creationTs);
                created.reactions = await reactions.count(created.creationTs);
                created.reacted = await reactions.reacted(created.creationTs);
                created.lastEditTs = created.lastModificationTs;
                delete created.lastModificationTs;
            }
            catch (e) {
                return reply(b.wrap(e));
            }
            return commons.checkAndSendSchema(created, exports.postSchema, log, reply);
        }).catch(e => reply(b.wrap(e)));
    }).catch(e => reply(b.wrap(e)));
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
        }).catch(e => reply(b.wrap(e)));
    }).catch(e => reply(b.wrap(e)));
}
exports.del = del;
async function serverGet(request, reply) {
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
    if (!options.where)
        options.where = {};
    // Force the cast
    options.where = options.where;
    let or = new Array();
    or.push({ privacy: posts_1.Privacy[posts_1.Privacy.public] });
    if (request.query.idToken && request.query.signature) {
        let friend = await utils.getFriendByToken(username, request.query.idToken);
        if (friend.status === friends_1.Status[friends_1.Status.accepted]) {
            or.push({ privacy: posts_1.Privacy[posts_1.Privacy.friends] });
        }
    }
    options.where['$or'] = or;
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
            return commons.checkAndSendSchema(res, exports.postsArray, log, reply);
        else
            return reply(b.unauthorized());
    }).catch(e => reply(b.wrap(e)));
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
        // We don't want people to be able to locate existing protected posts,
        // so we send the same error whether the post doesn't exist or the caller
        // isn't authorised to display it
        if (!post)
            return reply(b.notFound());
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
            return commons.checkAndSendSchema(res, exports.postSchema, log, reply);
        else
            reply(b.notFound());
    }).catch(e => reply(b.wrap(e)));
}
exports.serverGetSingle = serverGetSingle;
function getOptions(queryParams, order = 'DESC') {
    let options = {};
    // Set the order
    options.order = [['creationTs', order]];
    // Apply filters
    if (queryParams.nb)
        options.limit = queryParams.nb;
    // Filter by timestamp require a WHERE clause
    if (queryParams.from) {
        let filter = '$lte';
        if (order === 'ASC')
            filter = '$gte';
        let timestamp = {};
        if (queryParams.from)
            timestamp[filter] = queryParams.from;
        options.where = {};
        options.where.creationTs = timestamp;
    }
    return options;
}
exports.getOptions = getOptions;
