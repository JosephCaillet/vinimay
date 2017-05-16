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

import * as commons from '../utils/commons';
import * as utils from '../utils/serverUtils';
import * as postUtils from '../utils/postUtils';

import {username} from '../utils/username';

const printit = require('printit');

const clientLog = printit({
	date: true,
	prefix: 'Client:Posts'
});

const serverLog = printit({
	date: true,
	prefix: 'Server:Posts'
});

export let postSchema = j.object({
	"creationTs": j.number().min(1).required().description('Post creation timestamp'),
	"lastEditTs": j.number().min(1).required().description('Last modification timestamp (equals to the creation timestamp if the post has never been edited)'),
	"author": commons.user.description('Post author (using the `username@instance-domain.tld` format)'),
	"content": j.string().required().description('Post content'),
	"privacy": j.string().valid('public', 'private', 'friends').required().description('Post privacy setting (private, friends or public)'),
	"comments": j.number().min(0).required().description('Number of comments on the post'),
	"reactions": j.number().min(0).required().description('Numer of reactions on the post'),
	"reacted": j.boolean().required().description('Information on whether the current user reacted to the post')
}).label('Post');

export let postsArray = j.array().items(postSchema).required().label('Posts array');

export let responseSchema = j.object({
	"authenticated": j.bool().required().description('Boolean indicating whether the user is authenticated'),
	"posts": postsArray,
	"failures": j.array().items(commons.user).required().label('Requests failures')
}).label('Posts response');


export function get(request: h.Request, reply: h.IReply) {
	clientLog.debug('Getting posts');

	let instance = SequelizeWrapper.getInstance(username);
	let options = <s.FindOptions>getOptions(request.query);
	// We cast directly as post, so we don't need getters and setters
	options.raw = true;

	instance.model('post').findAll(options).then((posts: Post[]) => {
		clientLog.debug('Got', posts.length, 'local posts');
		let failures: Array<string> = new Array<string>();
		instance.model('user').findOne().then(async (user: s.Instance<any>) => {
			for(let i in posts) {
				let post: Post = posts[i];
				let author = new User(username, user.get('url'));
				clientLog.debug('Got current local user', author.toString());
				post.author = author.toString();
				try {
					post.comments = await comments.count(post.creationTs);
					post.reactions = await reactions.count(post.creationTs);
					post.reacted = await reactions.reacted(post.creationTs);
					post.lastEditTs = post.lastModificationTs;
					delete post.lastModificationTs;
				} catch(e) {
					return reply(b.wrap(e));
				}
			}
			// Get all friends for which a row has been created by us
			// This means that every friend except for accepted will behave
			// like following
			instance.model('friend').findAll({ where: {
				status: { $ne: Status[Status.incoming] }
			}}).then(async (friends: s.Instance<any>[]) => {
				clientLog.debug('Got', friends.length, 'friends to request');
				let promises = new Array<Promise<Post[]>>();
				for(let i in friends) {
					promises.push(new Promise((resolve, reject) => {						
						let friend = new User(friends[i].get('username'), friends[i].get('url'));
						clientLog.debug('Requesting posts from', friend.toString());
						// We need a copy of the object, and not a referece to it
						let params = Object.assign({}, request.query);
						postUtils.retrieveRemotePosts(friend,
							params, friends[i].get('id_token'), 
							friends[i].get('signature_token')
						).then((response) => {
							posts = posts.concat(response);
							resolve();
						}).catch((e) => {
							utils.handleRequestError(friend, e, clientLog, true);
							failures.push(friend.toString());
							resolve();
						});
					}))
				}
				return Promise.all(promises);
			}).then(() => {
				clientLog.debug('Retrieved all posts')
				posts.sort((a, b) => b.creationTs - a.creationTs);
				// We'll have more posts than requested, so we truncate the array
				if(request.query.nb) posts = posts.slice(0, request.query.nb);
				let rep: any = {
					authenticated: true, // Temporary hardcoded value
					posts: posts,
					failures: failures
				};
				clientLog.debug('Sent', posts.length, 'posts to client, with', failures.length, 'failures')
				return commons.checkAndSendSchema(rep, responseSchema, clientLog, reply);
			}).catch(e => reply(b.wrap(e)));
		}).catch(e => reply(b.wrap(e)));
	}).catch(e => reply(b.wrap(e)));
}

export async function getSingle(request: h.Request, reply: h.IReply) {
	clientLog.debug('Getting post', request.params.timestamp);

	let instance: s.Sequelize;

	try {
		let user = await utils.getUser(username)
		instance = SequelizeWrapper.getInstance(username);
	} catch(e) {
		return reply(b.wrap(e));
	}

	let author = new User(request.params.user);

	instance.model('user').findOne().then((user: s.Instance<any>) => {
		clientLog.debug('Got current local user', author.toString());
		// Check if the post is local or not
		if(!user.get('url').localeCompare(author.instance)) {
			clientLog.debug('Post is local');
			// We don't support multi-user instances yet
			instance.model('post').findById(request.params.timestamp).then(async (res: s.Instance<Post>) => {
				if(!res) return reply(b.notFound());
				let post = res.get({plain: true});
				post.author = author.toString();
				try {
					post.comments = await comments.count(post.creationTs);
					post.reactions = await reactions.count(post.creationTs);
					post.reacted = await reactions.reacted(post.creationTs);
					post.lastEditTs = post.lastModificationTs;
					delete post.lastModificationTs;
				} catch(e) {
					return reply(b.wrap(e));
				}
				commons.checkAndSendSchema(post, postSchema, clientLog, reply);
			}).catch(e => reply(b.wrap(e)));
		} else {
			clientLog.debug('Post is remote');
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
				// We want to retrieve only one post at a given timestamp
				postUtils.retrieveRemotePost(author, request.params.timestamp, idtoken, sigtoken).then((post: Post) => {
					clientLog.debug('Got post');
					return commons.checkAndSendSchema(post, postSchema, clientLog, reply);
				}).catch(e => utils.handleRequestError(author, e, clientLog, false, reply));
			}).catch(e => reply(b.wrap(e)));
		}
	}).catch(e => reply(b.wrap(e)));
}

export function create(request: h.Request, reply: h.IReply) {
	clientLog.debug('Creating post');
	// Javascript's timestamp is in miliseconds. We want it in seconds.
	let ts = (new Date()).getTime();
	let post: Post = {
		creationTs: ts,
		lastModificationTs: ts,
		content: request.payload.content,
		privacy: request.payload.privacy,
		comments: 0,
		reactions: 0,
		reacted: false
	};
	let instance = SequelizeWrapper.getInstance(username);
	instance.model('post').create(post).then(async (res: s.Instance<Post>) => {
		let created = res.get({ plain: true });
		clientLog.debug('Created post', created.creationTs);
		instance.model('user').findOne().then(async (user: s.Instance<any>) => {
			created.author = new User(username, user.get('url')).toString();
			clientLog.debug('Got current local user', created.author);
			try {
				created.comments = await comments.count(created.creationTs);
				created.reactions = await reactions.count(created.creationTs);
				created.reacted = await reactions.reacted(created.creationTs);
				created.lastEditTs = created.lastModificationTs;
				delete created.lastModificationTs;
			} catch(e) {
				return reply(b.wrap(e));
			}
			return commons.checkAndSendSchema(created, postSchema, clientLog, reply);
		}).catch(e => reply(b.wrap(e)));
	}).catch(e => reply(b.wrap(e)));
}

export async function del(request: h.Request, reply: h.IReply) {
	clientLog.debug('Deleting post', request.params.timestamp)
	let instance: s.Sequelize;
	let user: User;

	try {
		user = await utils.getUser(username);
		clientLog.debug('Got current local user', user.toString());
		instance = SequelizeWrapper.getInstance(user.username);
	} catch(e) {
		// If the user doesn't exist, we return an error
		return reply(b.badRequest(e));
	}

	// Run the query
	instance.model('post').destroy({ where: {
		creationTs: request.params.timestamp
	}}).then((nb) => {
		if(!nb) {
			clientLog.debug('No post deleted')
			return reply(b.notFound());
		}
		clientLog.debug('Deleted post')
		return reply(null).code(204);
	}).catch(e => reply(b.wrap(e)));
}

export async function serverGet(request: h.Request, reply: h.IReply) {
	serverLog.debug('Getting posts');
	let username = utils.getUsername(request);
	let instance: s.Sequelize;

	// Check if the user exists (the wrapper will return an error if not)
	try { instance = SequelizeWrapper.getInstance(username); } 
	catch(e) {
		serverLog.debug('Cannot find user');
		return reply(b.notFound(e));
	}

	let options = <s.FindOptions>getOptions(request.query);
	// We cast directly as post, so we don't need getters and setters
	options.raw = true;

	if(!options.where) options.where = {} as s.WhereOptions;
	// Force the cast
	options.where = options.where as s.WhereOptions;

	let or = new Array<any>();
	or.push({ privacy: Privacy[Privacy.public] });

	if(request.query.idToken && request.query.signature) {
		serverLog.debug('Trying to authenticate');

		let friend: any;
		try {
			friend = await utils.getFriendByToken(username, request.query.idToken);
		} catch(e) {
			if(e instanceof VinimayError) {
				serverLog.debug('Couldn\'t find friend');
				return reply(b.unauthorized(e.message));
			}
			return reply(b.wrap(e));
		}
		if(friend.status === Status[Status.accepted]) {
			or.push({ privacy: Privacy[Privacy.friends] });
		}
	}

	options.where['$or'] = or;

	instance.model('post').findAll(options).then(async (posts: Post[]) => {
		let res: Post | Post[] | undefined;
		serverLog.debug('Processing local posts');
		return postUtils.processPost(posts, request, username);
	}).then((res) => {
		// Forcing the cast so we can log the number of posts
		res = res as Post[];
		serverLog.debug(res.length, 'posts sent')
		if(res) return commons.checkAndSendSchema(res, postsArray, serverLog, reply);
		else return reply(b.unauthorized());
	}).catch(e => {
		if(e instanceof VinimayError) {
			return reply(b.unauthorized(e.message));
		}
		return reply(b.wrap(e))
	});
}

export function serverGetSingle(request: h.Request, reply: h.IReply) {
	serverLog.debug('Getting post', request.params.timestamp);
	let username = utils.getUsername(request);
	let instance: s.Sequelize;

	// Check if the user exists (the wrapper will return an error if not)
	try { instance = SequelizeWrapper.getInstance(username); } 
	catch(e) {
		serverLog.debug('Couldn\'t find local user');
		return reply(b.notFound(e));
	}

	instance.model('post').findById(request.params.timestamp, {
		raw: true
	}).then(async (post: Post) => {
		// We don't want people to be able to locate existing protected posts,
		// so we send the same error whether the post doesn't exist or the caller
		// isn't authorised to display it
		if(!post) return reply(b.notFound());
		let res: Post | Post[] | undefined;
		serverLog.debug('Processing post');
		try { res = await postUtils.processPost(post, request, username); }
		catch(e) {
			if(e instanceof VinimayError) {
				return reply(b.unauthorized(e.message));
			}
			return reply(b.wrap(e))
		}
		serverLog.debug('Post sent')
		if(res) return commons.checkAndSendSchema(res, postSchema, serverLog, reply);
		else reply(b.notFound());
	}).catch(e => reply(b.wrap(e)));
}

export function getOptions(queryParams, order = 'DESC') {
	let options = <s.FindOptions>{};
	// Set the order
	options.order = [['creationTs', order]]
	// Apply filters
	if(queryParams.nb) options.limit = queryParams.nb;
	// Filter by timestamp require a WHERE clause
	if(queryParams.from) {
		let filter = '$lte';
		if(order === 'ASC') filter = '$gte';
		let timestamp = <s.WhereOptions>{};
		if(queryParams.from) timestamp[filter] = queryParams.from;
		options.where = {};
		options.where.creationTs = timestamp;
	}
	
	return options;
}