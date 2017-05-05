"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
const b = require("boom");
const posts_1 = require("../models/posts");
const users_1 = require("../models/users");
const post_1 = require("./post");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username_1 = require("../utils/username");
const postUtils = require("../utils/postUtils");
const commentsUtils = require("../utils/commentUtils");
const utils = require("../utils/serverUtils");
const log = require('printit')({
    prefix: 'comments',
    date: true
});
exports.commentSchema = j.object({
    creationTs: j.number().required().description('The comment\'s creation timestamp'),
    lastEditTs: j.number().required().description('The comment\'s last modification timestamp'),
    author: j.string().required().email().description('The author of the comment'),
    content: j.string().required().description('The comment\'s content')
}).label('Comment');
exports.commentsArray = j.array().items(exports.commentSchema).required().description('Array of comments').label('Comments array');
exports.commentsSchema = j.object({
    authenticated: j.boolean().required().description('Boolean indicating whether the user is authenticated'),
    comments: exports.commentsArray
}).label('Comments response');
async function get(request, reply) {
    let instance;
    try {
        let user = await utils.getUser(username_1.username);
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    }
    catch (e) {
        return reply(b.wrap(e));
    }
    let author = new users_1.User(request.params.user);
    instance.model('user').findOne().then(async (user) => {
        let postExists;
        try {
            postExists = await postUtils.exists(username_1.username, parseInt(request.params.timestamp));
        }
        catch (e) {
            return reply(b.wrap(e));
        }
        // Check if the post is local or not
        if (!user.get('url').localeCompare(author.instance)) {
            // We don't support multi-user instances yet
            instance.model('comment').findAll(post_1.getOptions(request.query, 'creationTs_Post'))
                .then((comments) => {
                let res = new Array();
                for (let i in comments) {
                    let comment = comments[i];
                    res.push({
                        creationTs: comment.get('creationTs'),
                        lastEditTs: comment.get('lastModificationTs'),
                        author: user.toString(),
                        content: comment.get('content')
                    });
                }
                let rep = {
                    authenticated: true,
                    comments: res
                };
                let err;
                if (err = j.validate(rep, exports.commentsSchema).error) {
                    log.error(err);
                    return reply(b.badImplementation());
                }
                return reply(rep);
            });
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
                let user = new users_1.User(friend.get('username'), friend.get('url'));
                commentsUtils.retrieveRemoteComments(author, request.params.timestamp, idtoken, sigtoken).then((comments) => {
                    let rep = {
                        authenticated: true,
                        comments: comments
                    };
                    let err;
                    if (err = j.validate(rep, exports.commentsSchema).error) {
                        log.error(err);
                        return reply(b.badImplementation());
                    }
                    return reply(rep);
                }).catch(e => utils.handleRequestError(user, e, log, false, reply));
            }).catch(e => reply(b.wrap(e)));
        }
    }).catch(e => reply(b.wrap(e)));
}
exports.get = get;
function add(request, reply) {
}
exports.add = add;
function update(request, reply) {
}
exports.update = update;
function del(request, reply) {
}
exports.del = del;
async function serverGet(request, reply) {
    let user = await utils.getUser(utils.getUsername(request));
    let username = utils.getUsername(request);
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    }
    catch (e) {
        return reply(b.notFound());
    }
    let options = post_1.getOptions(request.query, 'creationTs_Post');
    // We cast directly as comment, so we don't need getters and setters
    options.raw = true;
    let friend;
    if (request.query.idToken) {
        try {
            let res = await instance.model('friend').findOne({ where: {
                    id_token: request.query.idToken
                }, raw: true });
            friend = new users_1.User(res.username, res.url);
        }
        catch (e) {
            return reply(b.wrap(e));
        }
    }
    instance.model('post').findOne({ where: {
            creationTs: request.params.timestamp
        }, raw: true }).then(async (post) => {
        if (!post)
            return reply(b.notFound());
        let canRead;
        try {
            canRead = await postUtils.canReadPost(username, posts_1.Privacy[post.privacy], friend);
        }
        catch (e) {
            return reply(b.wrap(e));
        }
        if (!canRead)
            return reply(b.notFound());
        instance.model('comment').findAll(options).then((comments) => {
            let res = new Array();
            for (let i in comments) {
                let comment = comments[i];
                res.push({
                    creationTs: comment.creationTs,
                    lastEditTs: comment.lastModificationTs,
                    author: user.toString(),
                    content: comment.content
                });
            }
            let err;
            if (err = j.validate(res, exports.commentsArray).error) {
                log.error(err);
                return reply(b.badImplementation());
            }
            return reply(res);
        }).catch(e => reply(b.wrap(e)));
    }).catch(e => reply(b.wrap(e)));
}
exports.serverGet = serverGet;
function serverAdd(request, reply) {
}
exports.serverAdd = serverAdd;
function count(postTimestamp) {
    return new Promise((ok, ko) => {
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username).model('comment').count({ where: {
                creationTs_Post: postTimestamp
            } }).then((count) => {
            ok(count);
        }).catch(e => ko(e));
    });
}
exports.count = count;
