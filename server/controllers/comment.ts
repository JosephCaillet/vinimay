import * as Hapi from 'hapi';
import * as Joi from 'joi';
import * as Boom from 'boom';
import * as sequelize from 'sequelize';
import * as request from 'request-promise-native/errors';

import {Post, Privacy} from '../models/posts';
import {User} from '../models/users';
import {Comment} from '../models/comments';

import {getOptions} from './post';

import {SequelizeWrapper} from '../utils/sequelizeWrapper';
import {username} from '../utils/username';
import {VinimayError} from '../utils/vinimayError';

import * as postUtils from '../utils/postUtils';
import * as commentsUtils from '../utils/commentUtils';
import * as utils from '../utils/serverUtils'
import * as commons from '../utils/commons'

const printit = require('printit');

const clientLog = printit({
	prefix: 'Client:Comments',
	date: true
});

const serverLog = printit({
	prefix: 'Server:Comments',
	date: true
});

export let commentSchema = Joi.object({
	creationTs: Joi.number().required().description('The comment\'s creation timestamp'),
	lastEditTs: Joi.number().required().description('The comment\'s last modification timestamp'),
	author: commons.user.required().description('The author of the comment'),
	content: Joi.string().required().description('The comment\'s content')
}).label('Comment');

export let commentsArray = Joi.array().items(commentSchema).required().description('Array of comments').label('Comments array');

export let commentsSchema = Joi.object({
	authenticated: Joi.boolean().required().description('Boolean indicating whether the user is authenticated'),
	comments: commentsArray
}).label('Comments response')

export let commentsInput = Joi.object({
	content: Joi.string().required().description('Comment content'),
	author: commons.user.description('Comment author (necessary for comments on public posts)')
}).label('Comment input')

export async function get(request: Hapi.Request, reply: Hapi.IReply) {
	let instance: sequelize.Sequelize;

	let user: User;

	try {
		user = await utils.getUser(username)
		instance = SequelizeWrapper.getInstance(username);
	} catch(e) {
		return reply(Boom.wrap(e));
	}

	let author = new User(request.params.user);

	instance.model('user').findOne().then(async (user: sequelize.Instance<any>) => {
		
		// Check if the post is local or not
		if(!user.get('url').localeCompare(author.instance)) {
			// Check if the post exists locally
			let postExists: boolean;
			try {
				postExists = await postUtils.exists(username, parseInt(request.params.timestamp));
			} catch(e) {
				return reply(Boom.wrap(e));
			}
			if(!postExists) return reply(Boom.notFound())

			let options = getOptions(request.query, 'ASC');
			// Use the post's creation timestamp to filter the results
			if(!options.where) options.where = {};
			options.where['creationTs_Post'] = request.params.timestamp;
			// We don't support multi-user instances yet
			instance.model('comment').findAll(options)
			.then((comments: sequelize.Instance<any>[]) => {
				let res = new Array<Comment>();
				for(let i in comments) {
					let comment = comments[i];
					let author = new User(comment.get('username'), comment.get('url'));
					res.push({
						creationTs: comment.get('creationTs'),
						lastEditTs: comment.get('lastModificationTs'),
						author: author.toString(),
						content: comment.get('content')
					});
				}
				let rep = {
					authenticated: true, // TODO: Change hard-coded value
					comments: res
				};
				return commons.checkAndSendSchema(rep, commentsSchema, clientLog, reply);
			}).catch(e => reply(Boom.wrap(e)));
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
				let timestamp = parseInt(request.params.timestamp);
				commentsUtils.retrieveRemoteComments(author, timestamp, {}, idtoken, sigtoken).then((comments: Comment[]) => {
					let rep = {
						authenticated: true,
						comments: comments
					};
					return commons.checkAndSendSchema(rep, commentsSchema, clientLog, reply)
				}).catch(e => utils.handleRequestError(author, e, clientLog, false, reply));
			}).catch(e => reply(Boom.wrap(e)));
		}
	}).catch(e => reply(Boom.wrap(e)));
}


export async function add(request: Hapi.Request, reply: Hapi.IReply) {
	let instance: sequelize.Sequelize;

	try {
		instance = SequelizeWrapper.getInstance(username);
	} catch(e) {
		return reply(Boom.wrap(e));
	}

	let author = await utils.getUser(username);
	let postAuthor = new User(request.params.user);

	// Check if the post is local or not
	if(!postAuthor.instance.localeCompare(author.instance)) {
		// We don't support multi-user instances yet

		// Check if the post exists locally
		let postExists: boolean;
		
		try {
			postExists = await postUtils.exists(username, parseInt(request.params.timestamp));
		} catch(e) {
			return reply(Boom.wrap(e));
		}
		
		if(!postExists) return reply(Boom.notFound());

		let timestamp = (new Date()).getTime()
		
		instance.model('comment').create({
			creationTs: timestamp,
			lastModificationTs: timestamp,
			creationTs_Post: request.params.timestamp,
			content: request.payload.content,
			username: author.username,
			url: author.instance
		}).then((comment: sequelize.Instance<any>) => {
			let author = new User(comment.get('username'), comment.get('url'));
			let res = {
				creationTs: comment.get('creationTs'),
				lastEditTs: comment.get('lastModificationTs'),
				author: author.toString(),
				content: comment.get('content')
			};
			return commons.checkAndSendSchema(res, commentSchema, clientLog, reply);
		}).catch(e => reply(Boom.wrap(e)))
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
			commentsUtils.createRemoteComment(author, postAuthor, timestamp, request.payload.content, idtoken, sigtoken).then((comment: Comment) => {
				return commons.checkAndSendSchema(comment, commentSchema, clientLog, reply);
			}).catch(e => utils.handleRequestError(postAuthor, e, clientLog, false, reply));
		}).catch(e => reply(Boom.wrap(e)));
	}
}


export function update(request: Hapi.Request, reply: Hapi.IReply) {
	
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
	let tsComment = parseInt(request.params.commentTimestamp);

	// Is the post local
	if(!user.instance.localeCompare(author.instance)) {
		// Is the post from the current user
		if(!user.username.localeCompare(author.username)) {
			instance.model('comment').destroy({ where: {
				creationTs_Post: tsPost,
				creationTs: tsComment
			}}).then((destroyedRows: number) => {
				// If no row was destroyed, 
				if(!destroyedRows) return reply(Boom.notFound());
				return reply(null).code(204);
			}).catch(e => reply(Boom.wrap(e)));
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
			commentsUtils.deleteRemoteComment(author, tsPost, tsComment, idtoken, sigtoken)
			.then(() => {
				return reply(null).code(204);
			}).catch(e => utils.handleRequestError(author, e, clientLog, false, reply));
		}).catch(e => reply(Boom.wrap(e)));
	}
}


export async function serverGet(request: Hapi.Request, reply: Hapi.IReply) {
	let username = utils.getUsername(request);
	let user = await utils.getUser(username);
	let instance: sequelize.Sequelize;

	try { instance = SequelizeWrapper.getInstance(username); }
	catch(e) { return reply(Boom.notFound()) }

	let friend: User;
	if(request.query.idToken) {
		try {
			let res: any = await instance.model('friend').findOne({where:{
				id_token: request.query.idToken
			}, raw: true });
			if(!res) return reply(Boom.unauthorized())
			friend = new User(res.username, res.url);
			let url = user + request.path;
			let params = Object.assign(request.params, request.query);
			let sig = utils.computeSignature('GET', url, params, res.signature_token)
			if(!utils.checkSignature(request.query.signature, sig)) {
				return reply(Boom.unauthorized('WRONG_SIGNATURE'))
			}
		} catch(e) {
			return reply(Boom.wrap(e));
		}
	}

	instance.model('post').findById(request.params.timestamp)
	.then(async (post: sequelize.Instance<Post>) => {
		if(!post) throw Boom.notFound();

		let canRead: boolean;
		try {
			let privacy: Privacy = Privacy[<string>post.get('privacy')];
			canRead = await postUtils.canReadPost(username, privacy, friend);
		} catch (e) {
			throw Boom.wrap(e);
		}

		if(!canRead) throw Boom.notFound();

		let options = <sequelize.FindOptions>getOptions(request.query, 'ASC');
		// Use the post's creation timestamp to filter the results
		if(!options.where) options.where = {};
		options.where['creationTs_Post'] = request.params.timestamp;
		// We cast directly as comment, so we don't need getters and setters
		options.raw = true;

		return instance.model('comment').findAll(options)
	}).then((comments: any[]) => {
		let res = new Array<Comment>();
		for(let i in comments) {
			let comment = comments[i];
			let author = new User(comment.username, comment.url);
			res.push({
				creationTs: comment.creationTs,
				lastEditTs: comment.lastModificationTs,
				author: author.toString(),
				content: comment.content
			});
		}
		return commons.checkAndSendSchema(res, commentsArray, serverLog, reply)
	}).catch(e => {
		if(e.isBoom) return reply(e);
		return reply(Boom.wrap(e))
	})
}


export async function serverAdd(request: Hapi.Request, reply: Hapi.IReply) {
	let username = utils.getUsername(request);
	let user = await utils.getUser(username);
	let instance: sequelize.Sequelize;

	try { instance = SequelizeWrapper.getInstance(username); }
	catch(e) { return reply(Boom.notFound()) }

	let friend: User;

	instance.model('post').findById(request.params.timestamp)
	.then(async (post: sequelize.Instance<Post>) => {
		if(!post) throw Boom.notFound();

		let privacy: Privacy = Privacy[<string>post.get('privacy')];

		let author: User;
		// Commenting on a public post requires info on the author as identification
		// isn't required
		if(privacy === Privacy.public) {
			let schema = commons.user.required().label('Comment author')
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
						return reply(Boom.unauthorized('WRONG_SIGNATURE'))
					}
				} catch(e) {
					if(e instanceof VinimayError) throw Boom.notFound();
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
					return reply(Boom.unauthorized('WRONG_SIGNATURE'))
				}
			} catch(e) {
				if(e instanceof VinimayError) throw Boom.notFound();
				throw e;
			}
		}

		let timestamp = (new Date()).getTime()

		return instance.model('comment').create({
			creationTs: timestamp,
			lastModificationTs: timestamp,
			creationTs_Post: request.params.timestamp,
			content: request.payload.content,
			username: author.username,
			url: author.instance
		})
	}).then((comment: sequelize.Instance<any>) => {
		let author = new User(comment.get('username'), comment.get('url'));
		let res = {
			creationTs: comment.get('creationTs'),
			lastEditTs: comment.get('lastModificationTs'),
			author: author.toString(),
			content: comment.get('content')
		};
		return commons.checkAndSendSchema(res, commentSchema, serverLog, reply);
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

	let comment: sequelize.Instance<any>;
	
	instance.model('comment').findOne({
		where: { creationTs: request.params.commentTimestamp }
	}).then((res: sequelize.Instance<any>) => {
		if(!res) throw Boom.notFound();
		comment = res;

		// No need to verify if the author's here if we have an idtoken
		if(request.query.idToken && request.query.signature) {
			return utils.getFriendByToken(username, request.query.idToken);
		} else {
			// If the user isn't a friend, use its entry from the profile table
			return instance.model('profile').findOne({where: {
				username: comment.get('username'),
				url: comment.get('url')
			}, raw: true });
		}
	}).then((friend) => {
		// If we don't know the user, it may be someone trying to exploit the
		// API to retrieve posts
		if(!friend) return reply(Boom.notFound());
		// Check if the author is a friend. If so, we verify the signature
		if(friend && friend.id_token && friend.signature_token) {
			let url = user + request.path;
			let params = Object.assign(request.params, request.query);
			let sig = utils.computeSignature('DELETE', url, params, friend.signature_token)
			if(!utils.checkSignature(request.query.signature, sig)) {
				throw Boom.unauthorized('WRONG_SIGNATURE');
			}
		} else {
			// TODO: Ask the comment's author's server to confirm the deletion
		}

		// Check if the user is the comment's author
		if(!friend.username.localeCompare(comment.get('username')) 
					&& !friend.url.localeCompare(comment.get('url'))) {
			comment.destroy();
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
		SequelizeWrapper.getInstance(username).model('comment').count({ where: {
			creationTs_Post: postTimestamp
		}}).then((count) => {
			ok(count);
		}).catch(e => ko(e));
	})
}