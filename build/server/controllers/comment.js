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
const printit = require('printit');
const clientLog = printit({
    prefix: 'Client:Comments',
    date: true
});
const serverLog = printit({
    prefix: 'Server:Comments',
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
    let user;
    try {
        user = await utils.getUser(username_1.username);
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    }
    catch (e) {
        return reply(Boom.wrap(e));
    }
    let author = new users_1.User(request.params.user);
    instance.model('user').findOne().then(async (user) => {
        // Check if the post is local or not
        if (!user.get('url').localeCompare(author.instance)) {
            // Check if the post exists locally
            let postExists;
            try {
                postExists = await postUtils.exists(username_1.username, parseInt(request.params.timestamp));
            }
            catch (e) {
                return reply(Boom.wrap(e));
            }
            if (!postExists)
                return reply(Boom.notFound());
            let options = post_1.getOptions(request.query, 'ASC');
            // Use the post's creation timestamp to filter the results
            if (!options.where)
                options.where = {};
            options.where['creationTs_Post'] = request.params.timestamp;
            // We don't support multi-user instances yet
            instance.model('comment').findAll(options)
                .then((comments) => {
                let res = new Array();
                for (let i in comments) {
                    let comment = comments[i];
                    let author = new users_1.User(comment.get('username'), comment.get('url'));
                    res.push({
                        creationTs: comment.get('creationTs'),
                        lastEditTs: comment.get('lastModificationTs'),
                        author: author.toString(),
                        content: comment.get('content')
                    });
                }
                let rep = {
                    authenticated: true,
                    comments: res
                };
                return commons.checkAndSendSchema(rep, exports.commentsSchema, clientLog, reply);
            }).catch(e => reply(Boom.wrap(e)));
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
                let timestamp = parseInt(request.params.timestamp);
                commentsUtils.retrieveRemoteComments(author, timestamp, {}, idtoken, sigtoken).then((comments) => {
                    let rep = {
                        authenticated: true,
                        comments: comments
                    };
                    return commons.checkAndSendSchema(rep, exports.commentsSchema, clientLog, reply);
                }).catch(e => utils.handleRequestError(author, e, clientLog, false, reply));
            }).catch(e => reply(Boom.wrap(e)));
        }
    }).catch(e => reply(Boom.wrap(e)));
}
exports.get = get;
async function add(request, reply) {
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    }
    catch (e) {
        return reply(Boom.wrap(e));
    }
    let author = await utils.getUser(username_1.username);
    let postAuthor = new users_1.User(request.params.user);
    // Check if the post is local or not
    if (!postAuthor.instance.localeCompare(author.instance)) {
        // We don't support multi-user instances yet
        // Check if the post exists locally
        let postExists;
        try {
            postExists = await postUtils.exists(username_1.username, parseInt(request.params.timestamp));
        }
        catch (e) {
            return reply(Boom.wrap(e));
        }
        if (!postExists)
            return reply(Boom.notFound());
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
            return commons.checkAndSendSchema(res, exports.commentSchema, clientLog, reply);
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
            let timestamp = parseInt(request.params.timestamp);
            commentsUtils.createRemoteComment(author, postAuthor, timestamp, request.payload.content, idtoken, sigtoken).then((comment) => {
                return commons.checkAndSendSchema(comment, exports.commentSchema, clientLog, reply);
            }).catch(e => utils.handleRequestError(postAuthor, e, clientLog, false, reply));
        }).catch(e => reply(Boom.wrap(e)));
    }
}
exports.add = add;
function update(request, reply) {
    reply(Boom.notImplemented());
}
exports.update = update;
async function del(request, reply) {
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    }
    catch (e) {
        return reply(Boom.wrap(e));
    }
    let user = await utils.getUser(username_1.username);
    let author = new users_1.User(request.params.user);
    let tsPost = parseInt(request.params.timestamp);
    let tsComment = parseInt(request.params.commentTimestamp);
    // Is the post local
    if (!user.instance.localeCompare(author.instance)) {
        // Is the post from the current user
        if (!user.username.localeCompare(author.username)) {
            instance.model('comment').destroy({ where: {
                    creationTs_Post: tsPost,
                    creationTs: tsComment
                } }).then((destroyedRows) => {
                // If no row was destroyed, 
                if (!destroyedRows)
                    return reply(Boom.notFound());
                return reply(null).code(204);
            }).catch(e => reply(Boom.wrap(e)));
        }
        else {
            // TODO: Suppoer multi-user
        }
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
            commentsUtils.deleteRemoteComment(author, tsPost, tsComment, idtoken, sigtoken)
                .then(() => {
                return reply(null).code(204);
            }).catch(e => utils.handleRequestError(author, e, clientLog, false, reply));
        }).catch(e => reply(Boom.wrap(e)));
    }
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
            throw Boom.notFound();
        let canRead;
        try {
            let privacy = posts_1.Privacy[post.get('privacy')];
            canRead = await postUtils.canReadPost(username, privacy, friend);
        }
        catch (e) {
            throw Boom.wrap(e);
        }
        if (!canRead)
            throw Boom.notFound();
        let options = post_1.getOptions(request.query, 'ASC');
        // Use the post's creation timestamp to filter the results
        if (!options.where)
            options.where = {};
        options.where['creationTs_Post'] = request.params.timestamp;
        // We cast directly as comment, so we don't need getters and setters
        options.raw = true;
        return instance.model('comment').findAll(options);
    }).then((comments) => {
        let res = new Array();
        for (let i in comments) {
            let comment = comments[i];
            let author = new users_1.User(comment.username, comment.url);
            res.push({
                creationTs: comment.creationTs,
                lastEditTs: comment.lastModificationTs,
                author: author.toString(),
                content: comment.content
            });
        }
        return commons.checkAndSendSchema(res, exports.commentsArray, serverLog, reply);
    }).catch(e => {
        if (e.isBoom)
            return reply(e);
        return reply(Boom.wrap(e));
    });
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
            throw Boom.notFound();
        let privacy = posts_1.Privacy[post.get('privacy')];
        let author;
        // Commenting on a public post requires info on the author as identification
        // isn't required
        if (privacy === posts_1.Privacy.public) {
            let schema = commons.user.required().label('Comment author');
            let err;
            if (err = Joi.validate(request.payload.author, schema).error) {
                throw Boom.badRequest(err);
            }
            // No need to check if we know the author if its a friend
            if (request.query.idToken && request.query.signature) {
                try {
                    let res = await utils.getFriendByToken(username, request.query.idToken);
                    author = new users_1.User(res.username, res.url);
                    if (!author || !await postUtils.canReadPost(username, privacy, author)) {
                        throw Boom.notFound();
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
                        throw Boom.notFound();
                    throw e;
                }
            }
            else {
                // author = new User(request.payload.author);
                // // Check if we know the author
                // let knownAuthor = !!(await instance.model('profile').count({where: {
                // 	url: author.instance,
                // 	username: author.username
                // }}));
                // 
                // // If we don't know the author, save it
                // if(!knownAuthor) {
                // 	await instance.model('profile').create({
                // 		url: author.instance,
                // 		username: author.username
                // 	});
                // }
                serverLog.debug('Comments on a posts are currently only supported between friends, even in public');
                throw Boom.forbidden();
                // TODO: Ask the server for confirmation on the addition
            }
        }
        else {
            if (!request.query.idToken)
                throw Boom.notFound();
            try {
                let res = await utils.getFriendByToken(username, request.query.idToken);
                author = new users_1.User(res.username, res.url);
                if (!author || !await postUtils.canReadPost(username, privacy, author)) {
                    throw Boom.notFound();
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
                    throw Boom.notFound();
                throw e;
            }
        }
        let timestamp = (new Date()).getTime();
        return instance.model('comment').create({
            creationTs: timestamp,
            lastModificationTs: timestamp,
            creationTs_Post: request.params.timestamp,
            content: request.payload.content,
            username: author.username,
            url: author.instance
        });
    }).then((comment) => {
        let author = new users_1.User(comment.get('username'), comment.get('url'));
        let res = {
            creationTs: comment.get('creationTs'),
            lastEditTs: comment.get('lastModificationTs'),
            author: author.toString(),
            content: comment.get('content')
        };
        return commons.checkAndSendSchema(res, exports.commentSchema, serverLog, reply);
    }).catch(e => {
        if (e.isBoom)
            return reply(e);
        return reply(Boom.wrap(e));
    });
}
exports.serverAdd = serverAdd;
async function serverDel(request, reply) {
    let username = utils.getUsername(request);
    let user = await utils.getUser(username);
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    }
    catch (e) {
        return reply(Boom.notFound());
    }
    let comment;
    instance.model('comment').findOne({
        where: { creationTs: request.params.commentTimestamp }
    }).then((res) => {
        if (!res)
            throw Boom.notFound();
        comment = res;
        // No need to verify if the author's here if we have an idtoken
        if (request.query.idToken && request.query.signature) {
            return utils.getFriendByToken(username, request.query.idToken);
        }
        else {
            // If the user isn't a friend, use its entry from the profile table
            return instance.model('profile').findOne({ where: {
                    username: comment.get('username'),
                    url: comment.get('url')
                }, raw: true });
        }
    }).then((friend) => {
        // If we don't know the user, it may be someone trying to exploit the
        // API to retrieve posts
        if (!friend)
            return reply(Boom.notFound());
        // Check if the author is a friend. If so, we verify the signature
        if (friend && friend.id_token && friend.signature_token) {
            let url = user + request.path;
            let params = Object.assign(request.params, request.query);
            let sig = utils.computeSignature('DELETE', url, params, friend.signature_token);
            if (!utils.checkSignature(request.query.signature, sig)) {
                throw Boom.unauthorized('WRONG_SIGNATURE');
            }
        }
        else {
            serverLog.debug('Comments on a posts are currently only supported between friends, even in public');
            throw Boom.forbidden();
            // TODO: Ask the comment's author's server to confirm the deletion
        }
        // Check if the user is the comment's author
        if (!friend.username.localeCompare(comment.get('username'))
            && !friend.url.localeCompare(comment.get('url'))) {
            comment.destroy();
            return reply(null).code(204);
        }
        else {
            throw Boom.unauthorized();
        }
    }).catch(e => {
        if (e.isBoom)
            return reply(e);
        return reply(Boom.wrap(e));
    });
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
