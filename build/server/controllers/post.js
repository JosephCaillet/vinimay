"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
const b = require("boom");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username = 'alice'; // TEMPORARY
function get(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    let options = getOptions(request.query);
    // We cast directly as post, so we don't need getters and setters
    options.raw = true;
    instance.model('post').findAll(options).then((posts) => {
        instance.model('user').findOne().then((user) => {
            for (let i in posts) {
                let post = posts[i];
                post.author = username + '@' + user.get('url');
            }
            reply(posts);
        }).catch(reply);
    }).catch(reply);
}
exports.get = get;
function getSingle(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    let user = request.params.user.split('@');
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(user[0]);
    }
    catch (e) {
        // If the user doesn't exist, we return an error
        return reply(e);
    }
    instance.model('post').findById(request.params.timestamp).then((res) => {
        let post = res.get({ plain: true });
        instance.model('user').findOne().then((user) => {
            post.author = username + '@' + user.get('url');
            reply(post);
        }).catch(reply);
    }).catch(reply);
}
exports.getSingle = getSingle;
function create(request, reply) {
    // Javascript's timestamp is in miliseconds. We want it in seconds.
    let ts = Math.round((new Date()).getTime() / 1000);
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
    let user = request.params.user.split('@');
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(user[0]);
    }
    catch (e) {
        // If the user doesn't exist, we return an error
        return reply(e);
    }
    instance.model('user').findOne().then((res) => {
        // Check if instance domain matches
        if (res.get('url').localeCompare(user[1])) {
            return reply(b.unauthorized);
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