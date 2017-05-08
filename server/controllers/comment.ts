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

const log = require('printit')({
	prefix: 'comments',
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

	try {
		let user = await utils.getUser(username)
		instance = SequelizeWrapper.getInstance(username);
	} catch(e) {
		return reply(Boom.wrap(e));
	}

	let author = new User(request.params.user);

	instance.model('user').findOne().then(async (user: sequelize.Instance<any>) => {
		let postExists: boolean;
		
		try {
			postExists = await postUtils.exists(username, parseInt(request.params.timestamp));
		} catch(e) {
			return reply(Boom.wrap(e));
		}
		
		if(!postExists) return reply(Boom.notFound())
		
		// Check if the post is local or not
		if(!user.get('url').localeCompare(author.instance)) {
			// We don't support multi-user instances yet
			instance.model('comment').findAll(getOptions(request.query, 'creationTs_Post'))
			.then((comments: sequelize.Instance<any>[]) => {
				let res = new Array<Comment>();
				for(let i in comments) {
					let comment = comments[i];
					res.push({
						creationTs: comment.get('creationTs'),
						lastEditTs: comment.get('lastModificationTs'),
						author: user.toString(),
						content: comment.get('content')
					});
				}
				let rep = {
					authenticated: true, // TODO: Change hard-coded value
					comments: res
				};
				return commons.checkAndSendSchema(rep, commentSchema, log, reply);
			})
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
				let user = new User(friend.get('username'), friend.get('url'));
				commentsUtils.retrieveRemoteComments(author, request.params.timestamp, {}, idtoken, sigtoken).then((comments: Comment[]) => {
					let rep = {
						authenticated: true,
						comments: comments
					};
					return commons.checkAndSendSchema(rep, commentsSchema, log, reply)
				}).catch(e => utils.handleRequestError(user, e, log, false, reply));
			}).catch(e => reply(Boom.wrap(e)));
		}
	}).catch(e => reply(Boom.wrap(e)));
}


export async function add(request: Hapi.Request, reply: Hapi.IReply) {
	let instance: sequelize.Sequelize;

	try {
		let user = await utils.getUser(username)
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
			return commons.checkAndSendSchema(res, commentSchema, log, reply);
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
			commentsUtils.createRemoteComment(author, postAuthor, request.params.timestamp, request.payload.content, idtoken, sigtoken).then((comment: Comment) => {
				return commons.checkAndSendSchema(comment, commentSchema, log, reply);
			}).catch(e => utils.handleRequestError(postAuthor, e, log, false, reply));
		}).catch(e => reply(Boom.wrap(e)));
	}
}


export function update(request: Hapi.Request, reply: Hapi.IReply) {
	
}


export function del(request: Hapi.Request, reply: Hapi.IReply) {
	
}


export async function serverGet(request: Hapi.Request, reply: Hapi.IReply) {
	let username = utils.getUsername(request);
	let user = await utils.getUser(username);
	let instance: sequelize.Sequelize;

	try { instance = SequelizeWrapper.getInstance(username); }
	catch(e) { return reply(Boom.notFound()) }

	let options = <sequelize.FindOptions>getOptions(request.query, 'creationTs_Post');
	// We cast directly as comment, so we don't need getters and setters
	options.raw = true;

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
		if(!post) return reply(Boom.notFound());

		let canRead: boolean;
		try {
			let privacy: Privacy = Privacy[<string>post.get('privacy')];
			canRead = await postUtils.canReadPost(username, privacy, friend);
		} catch (e) {
			return reply(Boom.wrap(e));
		}

		if(!canRead) return reply(Boom.notFound());

		instance.model('comment').findAll(options).then((comments: any[]) => {
			let res = new Array<Comment>();
			for(let i in comments) {
				let comment = comments[i];
				res.push({
					creationTs: comment.creationTs,
					lastEditTs: comment.lastModificationTs,
					author: user.toString(),
					content: comment.content
				});
			}
			return commons.checkAndSendSchema(res, commentsArray, log, reply)
		}).catch(e => reply(Boom.wrap(e)));
	}).catch(e => reply(Boom.wrap(e)));
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
		if(!post) return reply(Boom.notFound());

		let privacy: Privacy = Privacy[<string>post.get('privacy')];;

		let author: User;
		// Commenting on a public post requires info on the author as identification
		// isn't required
		if(privacy === Privacy.public) {
			let schema = commons.user.required().label('Comment author')
			let err;
			if(err = Joi.validate(request.payload.author, schema).error) {
				return reply(Boom.badRequest(err));
			}

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
		} else {
			if(!request.query.idToken) return reply(Boom.notFound())
			
			try {
				let res = await utils.getFriendByToken(username, request.query.idToken);
				author = new User(res.username, res.url);
				if(!author || !await postUtils.canReadPost(username, privacy, author)) {
					return reply(Boom.notFound());
				}
				let url = user + request.path;
				let params = Object.assign(request.params, request.query);
				params = Object.assign(params, request.payload);
				let sig = utils.computeSignature('POST', url, params, res.signature_token)
				if(!utils.checkSignature(request.query.signature, sig)) {
					return reply(Boom.unauthorized('WRONG_SIGNATURE'))
				}
			} catch(e) {
				if(e instanceof VinimayError) return reply(Boom.notFound())
				return reply(Boom.wrap(e));
			}
		}

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
			return commons.checkAndSendSchema(res, commentSchema, log, reply);
		}).catch(e => reply(Boom.wrap(e)))
	}).catch(e => reply(Boom.wrap(e)))
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