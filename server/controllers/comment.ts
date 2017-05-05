import * as h from 'hapi';
import * as j from 'joi';
import * as b from 'boom';
import * as s from 'sequelize';
import * as r from 'request-promise-native/errors';

import {Post, Privacy} from '../models/posts';
import {User} from '../models/users';
import {Comment} from '../models/comments';

import {getOptions} from './post';

import {SequelizeWrapper} from '../utils/sequelizeWrapper';
import {username} from '../utils/username';

import * as postUtils from '../utils/postUtils';
import * as commentsUtils from '../utils/commentUtils';
import * as utils from '../utils/serverUtils'

const log = require('printit')({
	prefix: 'comments',
	date: true
});

export let commentSchema = j.object({
	creationTs: j.number().required().description('The comment\'s creation timestamp'),
	lastEditTs: j.number().required().description('The comment\'s last modification timestamp'),
	author: j.string().required().email().description('The author of the comment'),
	content: j.string().required().description('The comment\'s content')
}).label('Comment');

export let commentsArray = j.array().items(commentSchema).required().description('Array of comments').label('Comments array');

export let commentsSchema = j.object({
	authenticated: j.boolean().required().description('Boolean indicating whether the user is authenticated'),
	comments: commentsArray
}).label('Comments response')

export async function get(request: h.Request, reply: h.IReply) {
	let instance: s.Sequelize;

	try {
		let user = await utils.getUser(username)
		instance = SequelizeWrapper.getInstance(username);
	} catch(e) {
		return reply(b.wrap(e));
	}

	let author = new User(request.params.user);

	instance.model('user').findOne().then(async (user: s.Instance<any>) => {
		let postExists: boolean;
		
		try {
			postExists = await postUtils.exists(username, parseInt(request.params.timestamp));
		} catch(e) {
			return reply(b.wrap(e));
		}
		// Check if the post is local or not
		if(!user.get('url').localeCompare(author.instance)) {
			// We don't support multi-user instances yet
			instance.model('comment').findAll(getOptions(request.query, 'creationTs_Post'))
			.then((comments: s.Instance<any>[]) => {
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
				let err;
				if(err = j.validate(rep, commentsSchema).error) {
					log.error(err);
					return reply(b.badImplementation())
				}
				return reply(rep);
			})
		} else {
			instance.model('friend').findOne({ where: {
				username: author.username,
				url: author.instance
			}}).then((friend: s.Instance<any>) => {
				let idtoken, sigtoken;
				// Set the token if the post author is known
				// Note: if the author isn't a friend (following doesn't count),
				// tokens will still be null/undefined
				if(friend) {
					idtoken = friend.get('id_token');
					sigtoken = friend.get('signature_token');
				}
				let user = new User(friend.get('username'), friend.get('url'));
				commentsUtils.retrieveRemoteComments(author, request.params.timestamp, idtoken, sigtoken).then((comments: Comment[]) => {
					let rep = {
						authenticated: true,
						comments: comments
					};
					let err;
					if(err = j.validate(rep, commentsSchema).error) {
						log.error(err);
						return reply(b.badImplementation())
					}
					return reply(rep);
				}).catch(e => utils.handleRequestError(user, e, log, false, reply));
			}).catch(e => reply(b.wrap(e)));
		}
	}).catch(e => reply(b.wrap(e)));
}


export function add(request: h.Request, reply: h.IReply) {
	
}


export function update(request: h.Request, reply: h.IReply) {
	
}


export function del(request: h.Request, reply: h.IReply) {
	
}


export async function serverGet(request: h.Request, reply: h.IReply) {
	let user = await utils.getUser(utils.getUsername(request));
	let username = utils.getUsername(request);
	let instance: s.Sequelize;

	try { instance = SequelizeWrapper.getInstance(username); }
	catch(e) { return reply(b.notFound()) }

	let options = <s.FindOptions>getOptions(request.query, 'creationTs_Post');
	// We cast directly as comment, so we don't need getters and setters
	options.raw = true;

	let friend: User;
	if(request.query.idToken) {
		try {
			let res: any = await instance.model('friend').findOne({where:{
				id_token: request.query.idToken
			}, raw: true });
			friend = new User(res.username, res.url);
		} catch(e) {
			return reply(b.wrap(e));
		}
	}
	
	instance.model('post').findOne({where:{
		creationTs: request.params.timestamp
	}, raw: true }).then(async (post: Post) => {
		if(!post) return reply(b.notFound());

		let canRead: boolean;
		try {
			canRead = await postUtils.canReadPost(username, Privacy[post.privacy], friend);
		} catch (e) {
			return reply(b.wrap(e));
		}

		if(!canRead) return reply(b.notFound());

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
			let err;
			if(err = j.validate(res, commentsArray).error) {
				log.error(err);
				return reply(b.badImplementation())
			}
			return reply(res);
		}).catch(e => reply(b.wrap(e)));
	}).catch(e => reply(b.wrap(e)));

}


export function serverAdd(request: h.Request, reply: h.IReply) {
	
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