import * as Hapi from 'hapi';
import * as Joi from 'joi';
import * as Boom from 'boom';
import * as sequelize from 'sequelize';

import {Post, Privacy} from '../models/posts';
import {User} from '../models/users';
import {SequelizeWrapper} from '../utils/sequelizeWrapper';
import {VinimayError} from '../utils/vinimayError';

import {username} from '../utils/username';
import * as commons from '../utils/commons';
import * as utils from '../utils/serverUtils';
import * as postUtils from '../utils/postUtils';
import * as reactionUtils from '../utils/reactionUtils';

const log = require('printit')({
	prefix: 'reactions',
	date: true
});

export const reactionsSchema = Joi.array().items(commons.user).required().description('Reactions').label('Reactions');

export const responseSchema = Joi.object({
	authenticated: Joi.boolean().required().description('Information on authentication status'),
	reactions: reactionsSchema
}).label('Reactions response');

export async function add(request: Hapi.Request, reply: Hapi.IReply) {
	let instance: sequelize.Sequelize;

	try {
		instance = SequelizeWrapper.getInstance(username);
	} catch(e) {
		return reply(Boom.wrap(e));
	}

	let author = await utils.getUser(username);
	let postAuthor = new User(request.params.user);

	let postExists: boolean;
	
	try {
		postExists = await postUtils.exists(username, parseInt(request.params.timestamp));
	} catch(e) {
		return reply(Boom.wrap(e));
	}

	if(!postExists) return reply(Boom.notFound());

	// Check if the post is local or not
	if(!postAuthor.instance.localeCompare(author.instance)) {
		// We don't support multi-user instances yet
		let timestamp = (new Date()).getTime()
		
		return instance.model('reaction').create({
			creationTs: request.params.timestamp,
			username: author.username,
			url: author.instance
		}).then((reaction: sequelize.Instance<any>) => {
			return reply(null).code(204);
		}).catch(e => reply(Boom.wrap(e)));
	} else {
		instance.model('friend').findOne({ where: {
			username: postAuthor.username,
			url: postAuthor.instance
		}}).then((friend: sequelize.Instance<any>) => {
			let idtoken, sigtoken;
			// Set the token if the post author is known
			// Note: if the author isn't a friend (following doesn't count),
			// tokens will still be null/undefined
			if(friend) {
				idtoken = friend.get('id_token');
				sigtoken = friend.get('signature_token');
			}
			let timestamp = parseInt(request.params.timestamp);
			reactionUtils.createRemoteReaction(author, postAuthor, timestamp, idtoken, sigtoken).then((reaction) => {
				return reply(null).code(204);
			}).catch(e => utils.handleRequestError(postAuthor, e, log, false, reply));
		}).catch(e => {
			if(e.isBoom) return reply(e);
			return reply(Boom.wrap(e))
		})
	}
}

export async function del(request: Hapi.Request, reply: Hapi.IReply) {
	let instance: sequelize.Sequelize;

	try {
		instance = SequelizeWrapper.getInstance(username);
	} catch(e) {
		return reply(Boom.wrap(e));
	}

	let user = await utils.getUser(username);
	let author = new User(request.params.user);

	let tsPost = parseInt(request.params.timestamp);

	// Is the post local
	if(!user.instance.localeCompare(author.instance)) {
		// Is the post from the current user
		if(!user.username.localeCompare(author.username)) {
			instance.model('reaction').destroy({ where: {
				url: author.instance,
				username: author.username,
				creationTs: request.params.timestamp
			}}).then((destroyedRows: number) => {
				// If no row was destroyed, 
				if(!destroyedRows) return reply(Boom.notFound());
				return reply(null).code(204);
			});
		} else {
			// TODO: Suppoer multi-user
		}
	} else {
		instance.model('friend').findOne({ where: {
			username: author.username,
			url: author.instance
		}}).then((friend: sequelize.Instance<any>) => {
			let idtoken, sigtoken;
			// Set the token if the post author is known
			// Note: if the author isn't a friend (following doesn't count),
			// tokens will still be null/undefined
			if(friend) {
				idtoken = friend.get('id_token');
				sigtoken = friend.get('signature_token');
			}
			reactionUtils.deleteRemoteReaction(author, tsPost, user, idtoken, sigtoken)
			.then(() => {
				return reply(null).code(204);
			}).catch(e => utils.handleRequestError(author, e, log, false, reply));
		});
	}
}

export async function serverAdd(request: Hapi.Request, reply: Hapi.IReply) {
	let username = utils.getUsername(request);
	let user = await utils.getUser(username);
	let instance: sequelize.Sequelize;

	try { instance = SequelizeWrapper.getInstance(username); }
	catch(e) { throw Boom.notFound(); }

	let friend: User;

	instance.model('post').findById(request.params.timestamp)
	.then(async (post: sequelize.Instance<Post>) => {
		if(!post) throw Boom.notFound();

		let privacy: Privacy = Privacy[<string>post.get('privacy')];

		let author: User;
		// Commenting on a public post requires info on the author as identification
		// isn't required
		if(privacy === Privacy.public) {
			let schema = commons.user.required().label('Reaction author')
			let err;
			if(err = Joi.validate(request.payload.author, schema).error) {
				throw Boom.badRequest(err);
			}

			// No need to check if we know the author if its a friend
			if(request.query.idToken && request.query.signature) {
				try {
					let res = await utils.getFriendByToken(username, request.query.idToken);
					author = new User(res.username, res.url);
					if(!author || !await postUtils.canReadPost(username, privacy, author)) {
						throw Boom.notFound();
					}
					let url = user + request.path;
					let params = Object.assign(request.params, request.query);
					params = Object.assign(params, request.payload);
					let sig = utils.computeSignature('POST', url, params, res.signature_token)
					if(!utils.checkSignature(request.query.signature, sig)) {
						throw Boom.unauthorized('WRONG_SIGNATURE');
					}
				} catch(e) {
					if(e instanceof VinimayError) throw Boom.notFound()
					throw e;
				}				
			} else {
				author = new User(request.payload.author);
				// Check if we know the author
				let knownAuthor = !!(await instance.model('profile').count({where: {
					url: author.instance,
					username: author.username
				}}));
				
				// If we don't know the author, save it
				if(!knownAuthor) {
					await instance.model('profile').create({
						url: author.instance,
						username: author.username
					});
				}
				
				// TODO: Ask the server for confirmation on the addition
			}

		} else {
			if(!request.query.idToken) throw Boom.notFound();

			try {
				let res = await utils.getFriendByToken(username, request.query.idToken);
				author = new User(res.username, res.url);
				if(!author || !await postUtils.canReadPost(username, privacy, author)) {
					throw Boom.notFound();
				}
				let url = user + request.path;
				let params = Object.assign(request.params, request.query);
				params = Object.assign(params, request.payload);
				let sig = utils.computeSignature('POST', url, params, res.signature_token)
				if(!utils.checkSignature(request.query.signature, sig)) {
					throw Boom.unauthorized('WRONG_SIGNATURE');
				}
			} catch(e) {
				if(e instanceof VinimayError) throw Boom.notFound();
				else throw e;
			}
		}

		let timestamp = (new Date()).getTime()

		return instance.model('reaction').create({
			creationTs: request.params.timestamp,
			username: author.username,
			url: author.instance
		})
	}).then((reaction: sequelize.Instance<any>) => {
		let author = new User(reaction.get('username'), reaction.get('url'));
		return commons.checkAndSendSchema(author.toString(), commons.user, log, reply);
	}).catch(e => {
		if(e.isBoom) return reply(e);
		return reply(Boom.wrap(e))
	})
}

export async function serverDel(request: Hapi.Request, reply: Hapi.IReply) {
	let username = utils.getUsername(request);
	let user = await utils.getUser(username);
	let instance: sequelize.Sequelize;

	try { instance = SequelizeWrapper.getInstance(username); }
	catch(e) { return reply(Boom.notFound()) }

	let reaction: sequelize.Instance<any>;
	let reactionAuthor = new User(request.payload.author);
	
	instance.model('reaction').findOne({ where: {
			url: reactionAuthor.instance,
			username: reactionAuthor.username,
			creationTs: request.params.timestamp
	}}).then((res: sequelize.Instance<any>) => {
		if(!res) throw Boom.notFound();
		reaction = res;

		// No need to verify if the author's here if we have an idtoken
		if(request.query.idToken && request.query.signature) {
			return utils.getFriendByToken(username, request.query.idToken);
		} else {
			// If the user isn't a friend, use its entry from the profile table
			return instance.model('profile').findOne({where: {
				username: reaction.get('username'),
				url: reaction.get('url')
			}, raw: true });
		}
	}).then((friend) => {
		// If we don't know the user, it may be someone trying to exploit the
		// API to retrieve posts
		if(!friend) throw Boom.notFound();
		// Check if the author is a friend. If so, we verify the signature
		if(friend && friend.id_token && friend.signature_token) {
			let url = user + request.path;
			let params = Object.assign(request.params, request.query);
			params = Object.assign(params, request.payload);
			let sig = utils.computeSignature('DELETE', url, params, friend.signature_token)
			if(!utils.checkSignature(request.query.signature, sig)) {
				throw Boom.unauthorized('WRONG_SIGNATURE');
			}
		} else {
			// TODO: Ask the reaction's author's server to confirm the deletion
		}

		// Check if the user is the reaction's author
		if(!friend.username.localeCompare(reaction.get('username')) 
					&& !friend.url.localeCompare(reaction.get('url'))) {
			reaction.destroy();
			return reply(null).code(204);
		} else {
			throw Boom.unauthorized();
		}
	}).catch(e => {
		if(e.isBoom) return reply(e);
		return reply(Boom.wrap(e))
	})
}


export function count(postTimestamp: number): Promise<number> {
	return new Promise<number>((ok, ko) => {
		SequelizeWrapper.getInstance(username).model('reaction').count({ where: {
			creationTs: postTimestamp
		}}).then((count) => {
			ok(count);
		}).catch(ko);
	})
}

export function reacted(postTimestamp: number, user?: User): Promise<boolean> {
	return new Promise<boolean>(async (ok, ko) => {
		let postUser = user || await utils.getUser(username);
		SequelizeWrapper.getInstance(username).model('reaction').count({ where: {
			creationTs: postTimestamp,
			username: postUser.username,
			url: postUser.instance
		}}).then((count) => {
			ok(!!count);
		}).catch(ko);
	})
}