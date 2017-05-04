import * as h from 'hapi';
import * as s from 'sequelize';
import * as j from 'joi';
import * as b from 'boom';
import * as r from 'request-promise-native/errors';

import {User} from '../models/users';
import {Post, Privacy} from '../models/posts';
import {Status} from '../models/friends';

import {SequelizeWrapper} from '../utils/sequelizeWrapper';
import {VinimayError} from '../utils/vinimayError';

import * as comments from './comment';
import * as reactions from './reaction';

import * as utils from '../utils/serverUtils';
import * as postUtils from '../utils/postUtils';

import {username} from '../utils/username';

const log = require('printit')({
	date: true,
	prefix: 'posts'
});

// TODO: Retrieve posts from friends too
export function get(request: h.Request, reply: h.IReply) {
	let instance = SequelizeWrapper.getInstance(username);
	let options = <s.FindOptions>getOptions(request.query);
	// We cast directly as post, so we don't need getters and setters
	options.raw = true;

	instance.model('post').findAll(options).then((posts: Post[]) => {
		instance.model('user').findOne().then(async (user: s.Instance<any>) => {
			for(let i in posts) {
				let post: Post = posts[i];
				let author = new User(username, user.get('url'));
				post.author = author.toString();
				try {
					post.comments = await comments.count(post.creationTs);
					post.reactions = await reactions.count(post.creationTs);
				} catch(e) {
					return reply(b.wrap(e));
				}
			}
			instance.model('friend').findAll({ where: {
				$or: [
					{status: Status[Status.accepted]},
					{status: Status[Status.following]}
				]
			}}).then(async (friends: s.Instance<any>[]) => {
				for(let i in friends) {
					let friend = new User(friends[i].get('username'), friends[i].get('url'));
					// We need a copy of the object, and not a referece to it
					let params = Object.assign({}, request.query);
					let fPosts: Post[];
					try {
						fPosts = await postUtils.retrieveRemotePosts(friend, params, friends[i].get('id_token'), friends[i].get('signature_token'));
					} catch(e) {
						if(e instanceof r.RequestError) {
							log.warn(e.error.code + ' when querying ' + friend);
						} else if(e instanceof r.StatusCodeError && e.statusCode === 400) {
							log.warn('Got a 400 error when querying ' + friend + '. This usually means the API was wrongly implemented either on the current instance or on the friend\'s.');
						} else {
							log.error(e)
						}
						continue;
					}
					for(let j in fPosts) {
						fPosts[j].author = friend.toString();
					}
					posts = posts.concat(fPosts);
				}
				posts.sort((a, b) => b.creationTs - a.creationTs);
				// We'll have more posts than requested, so we truncate the array
				posts = posts.slice(0, request.query.nb);
				reply({
					authenticated: true, // Temporary hardcoded value
					posts: posts
				});
			}).catch(e => reply(b.wrap(e)));
		}).catch(e => reply(b.wrap(e)));
	}).catch(e => reply(b.wrap(e)));
}

export async function getSingle(request: h.Request, reply: h.IReply) {
	let instance: s.Sequelize;

	try {
		let user = await utils.getUser(username)
		instance = SequelizeWrapper.getInstance(username);
	} catch(e) {
		return reply(b.wrap(e));
	}

	instance.model('post').findById(request.params.timestamp).then((res: s.Instance<Post>) => {
		if(!res) return reply(b.notFound());
		let post = res.get({plain: true});
		instance.model('user').findOne().then(async (user: s.Instance<any>) => {
			let author = new User(username, user.get('url'));
			post.author = author.toString();
			try {
				post.comments = await comments.count(post.creationTs);
				post.reactions = await reactions.count(post.creationTs);
			} catch(e) {
				return reply(b.wrap(e));
			}
			reply(post);
		}).catch(e => reply(b.wrap(e)));
	}).catch(e => reply(b.wrap(e)));
}

export function create(request: h.Request, reply: h.IReply) {
	// Javascript's timestamp is in miliseconds. We want it in seconds.
	let ts = (new Date()).getTime();
	let post: Post = {
		creationTs: ts,
		lastModificationTs: ts,
		content: request.payload.content,
		privacy: request.payload.privacy,
		comments: 0,
		reactions: 0
	};
	let instance = SequelizeWrapper.getInstance(username);
	instance.model('post').create(post).then((res: s.Instance<Post>) => {
		let created = res.get({ plain: true });
		instance.model('user').findOne().then((user: s.Instance<any>) => {
			created.author = new User(username, user.get('url')).toString();
			reply(created).code(200);
		}).catch(e => reply(b.wrap(e)));
	}).catch(e => reply(b.wrap(e)));
}

export async function del(request: h.Request, reply: h.IReply) {
	let instance: s.Sequelize;
	let user: User;

	try {
		user = await utils.getUser(username);
		instance = SequelizeWrapper.getInstance(user.username);
	} catch(e) {
		// If the user doesn't exist, we return an error
		return reply(b.badRequest(e));
	}

	instance.model('user').findOne().then((res: s.Instance<any>) => {
		// Check if instance domain matches
		if(res.get('url').localeCompare(user.instance)) {
			return reply(b.unauthorized());
		}
		// Run the query
		instance.model('post').destroy({ where: {
			creationTs: request.params.timestamp
		}}).then(() => {
			reply(null).code(204);
		}).catch(e => reply(b.wrap(e)));
	}).catch(e => reply(b.wrap(e)));
}

export function serverGet(request: h.Request, reply: h.IReply) {
	let username = utils.getUsername(request);
	let instance: s.Sequelize;

	// Check if the user exists (the wrapper will return an error if not)
	try { instance = SequelizeWrapper.getInstance(username); } 
	catch(e) { return reply(b.notFound(e)); }

	let options = <s.FindOptions>getOptions(request.query);
	// We cast directly as post, so we don't need getters and setters
	options.raw = true;

	instance.model('post').findAll(options).then(async (posts: Post[]) => {
		let res: Post | Post[] | undefined;
		try { res = await postUtils.processPost(posts, request, username); }
		catch(e) {
			if(e instanceof VinimayError) {
				return reply(b.unauthorized(e.message));
			}
			return reply(b.wrap(e))
		}
		if(res) return reply(res);
		else return reply(b.unauthorized());
	}).catch(e => reply(b.wrap(e)));
}

export function serverGetSingle(request: h.Request, reply: h.IReply) {
	let username = utils.getUsername(request);
	let instance: s.Sequelize;

	// Check if the user exists (the wrapper will return an error if not)
	try { instance = SequelizeWrapper.getInstance(username); } 
	catch(e) { return reply(b.notFound(e)); }

	instance.model('post').findById(request.params.timestamp, {
		raw: true
	}).then(async (post: Post) => {
		let res: Post | Post[] | undefined;
		try { res = await postUtils.processPost(post, request, username); }
		catch(e) {
			if(e instanceof VinimayError) {
				return reply(b.unauthorized(e.message));
			}
			return reply(b.wrap(e))
		}
		if(res) return reply(res);
		else reply(b.unauthorized());
	}).catch(e => reply(b.wrap(e)));
}

export let postSchema = j.object({
	"creationTs": j.number().min(1).required().description('Post creation timestamp'),
	"lastEditTs": j.number().min(1).required().description('Last modification timestamp (equals to the creation timestamp if the post has never been edited)'),
	"author": j.string().email().required().description('Post author (using the `username@instance-domain.tld` format)'),
	"content": j.string().required().description('Post content'),
	"privacy": j.string().valid('public', 'private', 'friends').required().description('Post privacy setting (private, friends or public)'),
	"comments": j.number().min(0).required().description('Number of comments on the post'),
	"reactions": j.number().min(0).required().description('Numer of reactions on the post')
}).label('Post');

export let responseSchema = j.object({
	"authenticated": j.bool().required().description('Boolean indicating whether the user is authenticated'),
	"posts": j.array().items(postSchema).required().label('Posts array')
}).label('Posts response');

function getOptions(queryParams) {
	let options = <s.FindOptions>{};
	// Set the order
	options.order = [['creationTs', 'DESC']]
	// Apply filters
	if(queryParams.start) options.offset = queryParams.start;
	if(queryParams.nb) options.limit = queryParams.nb;
	// Filter by timestamp require a WHERE clause
	if(queryParams.from || queryParams.to) {
		let timestamp = <s.WhereOptions>{};
		if(queryParams.from) timestamp['$lte'] = queryParams.from;
		if(queryParams.to) timestamp['$gte'] = queryParams.to;
		options.where = { creationTs: timestamp };
	}
	
	return options;
}