"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const Boom = require("boom");
const posts_1 = require("../models/posts");
const users_1 = require("../models/users");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const vinimayError_1 = require("../utils/vinimayError");
const username_1 = require("../utils/username");
const commons = require("../utils/commons");
const utils = require("../utils/serverUtils");
const postUtils = require("../utils/postUtils");
const reactionUtils = require("../utils/reactionUtils");
const printit = require('printit');
const clientLog = printit({
    prefix: 'Client:Reactions',
    date: true
});
const serverLog = printit({
    prefix: 'Server:Reactions',
    date: true
});
exports.reactionsSchema = Joi.array().items(commons.user).required().description('Reactions').label('Reactions');
exports.responseSchema = Joi.object({
    authenticated: Joi.boolean().required().description('Information on authentication status'),
    reactions: exports.reactionsSchema
}).label('Reactions response');
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
    clientLog.debug('Adding reaction on post', request.params.timestamp, 'by', postAuthor.toString());
    // Check if the post is local or not
    if (!postAuthor.instance.localeCompare(author.instance)) {
        // We don't support multi-user instances yet
        clientLog.debug('Post is local');
        let postExists;
        try {
            postExists = await postUtils.exists(username_1.username, parseInt(request.params.timestamp));
        }
        catch (e) {
            return reply(Boom.wrap(e));
        }
        if (!postExists) {
            clientLog.debug('Post does not exist');
            return reply(Boom.notFound());
        }
        ;
        let timestamp = (new Date()).getTime();
        reacted(parseInt(request.params.timestamp))
            .then((hasReacted) => {
            if (hasReacted) {
                clientLog.debug('User has already reacted to this post');
                throw Boom.conflict();
            }
            return instance.model('reaction').create({
                creationTs: request.params.timestamp,
                username: author.username,
                url: author.instance
            });
        }).then(() => {
            return reply(null).code(204);
        }).catch(e => {
            if (e.isBoom)
                return reply(e);
            return reply(Boom.wrap(e));
        });
    }
    else {
        clientLog.debug('Post is remote');
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
            clientLog.debug('Adding a reaction to', postAuthor.toString() + '\'s', 'post');
            reactionUtils.createRemoteReaction(author, postAuthor, timestamp, idtoken, sigtoken).then(() => {
                clientLog.debug('Added a reaction to', postAuthor.toString() + '\'s', 'post');
                return reply(null).code(204);
            }).catch(e => utils.handleRequestError(postAuthor, e, clientLog, false, reply));
        }).catch(e => {
            if (e.isBoom)
                return reply(e);
            return reply(Boom.wrap(e));
        });
    }
}
exports.add = add;
async function del(request, reply) {
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    }
    catch (e) {
        return reply(Boom.wrap(e));
    }
    let postExists;
    try {
        postExists = await postUtils.exists(username_1.username, parseInt(request.params.timestamp));
    }
    catch (e) {
        return reply(Boom.wrap(e));
    }
    if (!postExists) {
        clientLog.debug('Post does not exist');
        return reply(Boom.notFound());
    }
    ;
    let user = await utils.getUser(username_1.username);
    let author = new users_1.User(request.params.user);
    let tsPost = parseInt(request.params.timestamp);
    // Is the post local
    if (!user.instance.localeCompare(author.instance)) {
        // Is the post from the current user
        if (!user.username.localeCompare(author.username)) {
            instance.model('reaction').destroy({ where: {
                    url: author.instance,
                    username: author.username,
                    creationTs: request.params.timestamp
                } }).then((destroyedRows) => {
                // If no row was destroyed, it means the reaction didn't exist
                // in the first place
                if (!destroyedRows)
                    return reply(Boom.notFound());
                return reply(null).code(204);
            });
        }
        else {
            // TODO: Support multi-user
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
            reactionUtils.deleteRemoteReaction(author, tsPost, user, idtoken, sigtoken)
                .then(() => {
                return reply(null).code(204);
            }).catch(e => utils.handleRequestError(author, e, clientLog, false, reply));
        });
    }
}
exports.del = del;
async function serverAdd(request, reply) {
    let username = utils.getUsername(request);
    let user = await utils.getUser(username);
    serverLog.debug('Adding reaction on post', request.params.timestamp);
    let instance;
    try {
        instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username);
    }
    catch (e) {
        throw Boom.notFound();
    }
    let friend;
    let author;
    instance.model('post').findById(request.params.timestamp)
        .then(async (post) => {
        if (!post) {
            serverLog.debug('Post does not exist');
            throw Boom.notFound();
        }
        let privacy = posts_1.Privacy[post.get('privacy')];
        // Commenting on a public post requires info on the author as identification
        // isn't required
        if (privacy === posts_1.Privacy.public) {
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
                        throw Boom.unauthorized('WRONG_SIGNATURE');
                    }
                }
                catch (e) {
                    if (e instanceof vinimayError_1.VinimayError)
                        throw Boom.notFound();
                    throw e;
                }
            }
            else {
                let schema = commons.user.required().label('Reaction author');
                let err;
                if (err = Joi.validate(request.payload.author, schema).error) {
                    throw Boom.badRequest(err);
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
                    throw Boom.unauthorized('WRONG_SIGNATURE');
                }
            }
            catch (e) {
                if (e instanceof vinimayError_1.VinimayError)
                    throw Boom.notFound();
                else
                    throw e;
            }
        }
        let timestamp = (new Date()).getTime();
        serverLog.debug('Identified the reaction author as', author.toString());
        return reacted(parseInt(request.params.timestamp), author);
    }).then((hasReacted) => {
        if (hasReacted) {
            serverLog.debug('User has already reacted to this post');
            throw Boom.conflict();
        }
        return instance.model('reaction').create({
            creationTs: request.params.timestamp,
            username: author.username,
            url: author.instance
        });
    }).then((reaction) => {
        let author = new users_1.User(reaction.get('username'), reaction.get('url'));
        serverLog.debug('Created reaction for user', author.toString());
        return commons.checkAndSendSchema(author.toString(), commons.user, serverLog, reply);
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
    let reaction;
    let reactionAuthor = new users_1.User(request.payload.author);
    instance.model('reaction').findOne({ where: {
            url: reactionAuthor.instance,
            username: reactionAuthor.username,
            creationTs: request.params.timestamp
        } }).then((res) => {
        if (!res)
            throw Boom.notFound();
        reaction = res;
        // No need to verify if the author's here if we have an idtoken
        if (request.query.idToken && request.query.signature) {
            return utils.getFriendByToken(username, request.query.idToken);
        }
        else {
            // If the user isn't a friend, use its entry from the profile table
            return instance.model('profile').findOne({ where: {
                    username: reaction.get('username'),
                    url: reaction.get('url')
                }, raw: true });
        }
    }).then((friend) => {
        // If we don't know the user, it may be someone trying to exploit the
        // API to retrieve posts
        if (!friend)
            throw Boom.notFound();
        // Check if the author is a friend. If so, we verify the signature
        if (friend && friend.id_token && friend.signature_token) {
            let url = user + request.path;
            let params = Object.assign(request.params, request.query);
            params = Object.assign(params, request.payload);
            let sig = utils.computeSignature('DELETE', url, params, friend.signature_token);
            if (!utils.checkSignature(request.query.signature, sig)) {
                throw Boom.unauthorized('WRONG_SIGNATURE');
            }
        }
        else {
            // TODO: Ask the reaction's author's server to confirm the deletion
        }
        // Check if the user is the reaction's author
        if (!friend.username.localeCompare(reaction.get('username'))
            && !friend.url.localeCompare(reaction.get('url'))) {
            reaction.destroy();
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
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username).model('reaction').count({ where: {
                creationTs: postTimestamp
            } }).then((count) => {
            ok(count);
        }).catch(ko);
    });
}
exports.count = count;
function reacted(postTimestamp, user) {
    return new Promise(async (ok, ko) => {
        let postUser = user || await utils.getUser(username_1.username);
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username).model('reaction').count({ where: {
                creationTs: postTimestamp,
                username: postUser.username,
                url: postUser.instance
            } }).then((count) => {
            ok(!!count);
        }).catch(ko);
    });
}
exports.reacted = reacted;
