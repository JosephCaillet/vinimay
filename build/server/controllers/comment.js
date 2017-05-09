"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const Boom = require("boom");
const posts_1 = require("../models/posts");
const users_1 = require("../models/users");
const post_1 = require("./post");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username_1 = require("../utils/username");
const vinimayError_1 = require("../utils/vinimayError");
const postUtils = require("../utils/postUtils");
const commentsUtils = require("../utils/commentUtils");
const utils = require("../utils/serverUtils");
const commons = require("../utils/commons");
const log = require('printit')({
    prefix: 'comments',
    date: true
});
exports.commentSchema = Joi.object({
    creationTs: Joi.number().required().description('The comment\'s creation timestamp'),
    lastEditTs: Joi.number().required().description('The comment\'s last modification timestamp'),
    author: commons.user.required().description('The author of the comment'),
    content: Joi.string().required().description('The comment\'s content')
}).label('Comment');
exports.commentsArray = Joi.array().items(exports.commentSchema).required().description('Array of comments').label('Comments array');
exports.commentsSchema = Joi.object({
    authenticated: Joi.boolean().required().description('Boolean indicating whether the user is authenticated'),
    comments: exports.commentsArray
}).label('Comments response');
exports.commentsInput = Joi.object({
    content: Joi.string().required().description('Comment content'),
    author: commons.user.description('Comment author (necessary for comments on public posts)')
}).label('Comment input');
async function get(request, reply) {
    let instance;
    try {
        let user = await utils.getUser(username_1.username);
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    }
    catch (e) {
        return reply(Boom.wrap(e));
    }
    let author = new users_1.User(request.params.user);
    instance.model('user').findOne().then(async (user) => {
        let postExists;
        try {
            postExists = await postUtils.exists(username_1.username, parseInt(request.params.timestamp));
        }
        catch (e) {
            return reply(Boom.wrap(e));
        }
        if (!postExists)
            return reply(Boom.notFound());
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
                return commons.checkAndSendSchema(rep, exports.commentsSchema, log, reply);
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
                commentsUtils.retrieveRemoteComments(author, request.params.timestamp, {}, idtoken, sigtoken).then((comments) => {
                    let rep = {
                        authenticated: true,
                        comments: comments
                    };
                    return commons.checkAndSendSchema(rep, exports.commentsSchema, log, reply);
                }).catch(e => utils.handleRequestError(user, e, log, false, reply));
            }).catch(e => reply(Boom.wrap(e)));
        }
    }).catch(e => reply(Boom.wrap(e)));
}
exports.get = get;
async function add(request, reply) {
    let instance;
    try {
        let user = await utils.getUser(username_1.username);
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    }
    catch (e) {
        return reply(Boom.wrap(e));
    }
    let author = await utils.getUser(username_1.username);
    let postAuthor = new users_1.User(request.params.user);
    let postExists;
    try {
        postExists = await postUtils.exists(username_1.username, parseInt(request.params.timestamp));
    }
    catch (e) {
        return reply(Boom.wrap(e));
    }
    if (!postExists)
        return reply(Boom.notFound());
    // Check if the post is local or not
    if (!postAuthor.instance.localeCompare(author.instance)) {
        // We don't support multi-user instances yet
        let timestamp = (new Date()).getTime();
        instance.model('comment').create({
            creationTs: timestamp,
            lastModificationTs: timestamp,
            creationTs_Post: request.params.timestamp,
            content: request.payload.content,
            username: author.username,
            url: author.instance
        }).then((comment) => {
            let author = new users_1.User(comment.get('username'), comment.get('url'));
            let res = {
                creationTs: comment.get('creationTs'),
                lastEditTs: comment.get('lastModificationTs'),
                author: author.toString(),
                content: comment.get('content')
            };
            return commons.checkAndSendSchema(res, exports.commentSchema, log, reply);
        }).catch(e => reply(Boom.wrap(e)));
    }
    else {
        instance.model('friend').findOne({ where: {
                username: postAuthor.username,
                url: postAuthor.instance
            } }).then((friend) => {
            let idtoken, sigtoken;
            // Set the token if the post author is known
            // Note: if the author isn't a friend (following doesn't count),
            // tokens will still be null/undefined
            if (friend) {
                idtoken = friend.get('id_token');
                sigtoken = friend.get('signature_token');
            }
            commentsUtils.createRemoteComment(author, postAuthor, request.params.timestamp, request.payload.content, idtoken, sigtoken).then((comment) => {
                return commons.checkAndSendSchema(comment, exports.commentSchema, log, reply);
            }).catch(e => utils.handleRequestError(postAuthor, e, log, false, reply));
        }).catch(e => reply(Boom.wrap(e)));
    }
}
exports.add = add;
function update(request, reply) {
}
exports.update = update;
function del(request, reply) {
}
exports.del = del;
async function serverGet(request, reply) {
    let username = utils.getUsername(request);
    let user = await utils.getUser(username);
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    }
    catch (e) {
        return reply(Boom.notFound());
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
            if (!res)
                return reply(Boom.unauthorized());
            friend = new users_1.User(res.username, res.url);
            let url = user + request.path;
            let params = Object.assign(request.params, request.query);
            let sig = utils.computeSignature('GET', url, params, res.signature_token);
            if (!utils.checkSignature(request.query.signature, sig)) {
                return reply(Boom.unauthorized('WRONG_SIGNATURE'));
            }
        }
        catch (e) {
            return reply(Boom.wrap(e));
        }
    }
    instance.model('post').findById(request.params.timestamp)
        .then(async (post) => {
        if (!post)
            return reply(Boom.notFound());
        let canRead;
        try {
            let privacy = posts_1.Privacy[post.get('privacy')];
            canRead = await postUtils.canReadPost(username, privacy, friend);
        }
        catch (e) {
            return reply(Boom.wrap(e));
        }
        if (!canRead)
            return reply(Boom.notFound());
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
            return commons.checkAndSendSchema(res, exports.commentsArray, log, reply);
        }).catch(e => reply(Boom.wrap(e)));
    }).catch(e => reply(Boom.wrap(e)));
}
exports.serverGet = serverGet;
async function serverAdd(request, reply) {
    let username = utils.getUsername(request);
    let user = await utils.getUser(username);
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    }
    catch (e) {
        return reply(Boom.notFound());
    }
    let friend;
    instance.model('post').findById(request.params.timestamp)
        .then(async (post) => {
        if (!post)
            return reply(Boom.notFound());
        let privacy = posts_1.Privacy[post.get('privacy')];
        ;
        let author;
        // Commenting on a public post requires info on the author as identification
        // isn't required
        if (privacy === posts_1.Privacy.public) {
            let schema = commons.user.required().label('Comment author');
            let err;
            if (err = Joi.validate(request.payload.author, schema).error) {
                return reply(Boom.badRequest(err));
            }
            author = new users_1.User(request.payload.author);
            // Check if we know the author
            let knownAuthor = !!(await instance.model('profile').count({ where: {
                    url: author.instance,
                    username: author.username
                } }));
            // If we don't know the author, save it
            if (!knownAuthor) {
                await instance.model('profile').create({
                    url: author.instance,
                    username: author.username
                });
            }
        }
        else {
            if (!request.query.idToken)
                return reply(Boom.notFound());
            try {
                let res = await utils.getFriendByToken(username, request.query.idToken);
                author = new users_1.User(res.username, res.url);
                if (!author || !await postUtils.canReadPost(username, privacy, author)) {
                    return reply(Boom.notFound());
                }
                let url = user + request.path;
                let params = Object.assign(request.params, request.query);
                params = Object.assign(params, request.payload);
                let sig = utils.computeSignature('POST', url, params, res.signature_token);
                if (!utils.checkSignature(request.query.signature, sig)) {
                    return reply(Boom.unauthorized('WRONG_SIGNATURE'));
                }
            }
            catch (e) {
                if (e instanceof vinimayError_1.VinimayError)
                    return reply(Boom.notFound());
                return reply(Boom.wrap(e));
            }
        }
        let timestamp = (new Date()).getTime();
        instance.model('comment').create({
            creationTs: timestamp,
            lastModificationTs: timestamp,
            creationTs_Post: request.params.timestamp,
            content: request.payload.content,
            username: author.username,
            url: author.instance
        }).then((comment) => {
            let author = new users_1.User(comment.get('username'), comment.get('url'));
            let res = {
                creationTs: comment.get('creationTs'),
                lastEditTs: comment.get('lastModificationTs'),
                author: author.toString(),
                content: comment.get('content')
            };
            return commons.checkAndSendSchema(res, exports.commentSchema, log, reply);
        }).catch(e => reply(Boom.wrap(e)));
    }).catch(e => reply(Boom.wrap(e)));
}
exports.serverAdd = serverAdd;
function serverDel(request, reply) {
}
exports.serverDel = serverDel;
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
