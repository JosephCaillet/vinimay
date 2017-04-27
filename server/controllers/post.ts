import * as h from 'hapi';
import * as s from 'sequelize';
import * as j from 'joi';
import * as b from 'boom';

import {User} from '../models/users';
import {Post, Privacy} from '../models/posts';
import {Status} from '../models/friends';

import {SequelizeWrapper} from '../utils/sequelizeWrapper';

import * as utils from '../utils/serverUtils';

const username = 'alice'; // TEMPORARY
//const friend = 'francis@localhost:3005';
const friend = 'bob@localhost:3001';

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
			}
			reply(posts);
		}).catch(reply);
	}).catch(reply);
}

export function getSingle(request: h.Request, reply: h.IReply) {
	let instance = SequelizeWrapper.getInstance(username);
	let user = new User(request.params.user);

	try {
		instance = SequelizeWrapper.getInstance(user[0]);
	} catch(e) {
		// If the user doesn't exist, we return an error
		return reply(b.badRequest(e));
	}

	instance.model('post').findById(request.params.timestamp).then((res: s.Instance<Post>) => {
		let post = res.get({plain: true});
		instance.model('user').findOne().then((user: s.Instance<any>) => {
			let author = new User(username, user.get('url'));
			post.author = author.toString();
			reply(post);
		}).catch(reply);
	}).catch(reply);
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
			created.author = username + '@' + user.get('url');
			reply(created).code(200);
		}).catch(reply);
	}).catch(reply);
}

export function del(request: h.Request, reply: h.IReply) {
	let user = new User(request.params.user);

	let instance: s.Sequelize;

	try {
		instance = SequelizeWrapper.getInstance(user.username);
	} catch(e) {
		// If the user doesn't exist, we return an error
		return reply(b.badRequest(e));
	}

	instance.model('user').findOne().then((res: s.Instance<any>) => {
		// Check if instance domain matches
		if(res.get('url').localeCompare(user[1])) {
			return reply(b.unauthorized());
		}
		// Run the query
		instance.model('post').destroy({ where: {
			creationTs: request.params.timestamp
		}}).then(() => {
			reply(null).code(204);
		}).catch(reply);
	}).catch(reply);
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
		if(request.query.idToken) {
			instance.model('friend').findOne({
				where: { id_token: request.query.idToken }
			}).then(async (friendInstance: s.Instance<any>) => {
				if(!friendInstance) return reply(b.unauthorized('UNKNOWN_TOKEN'))
				let user = (await utils.getUser(username)).toString();
				let url = user + request.path;
				let token = friendInstance.get('signature_token')
				let signature = utils.computeSignature(request.method, url, request.query, token);
				if(!utils.checkSignature(request.query.signature, signature)) {
					return reply(b.badRequest('WRONG_SIGNATURE'))
				}
				let res: Post[] = new Array<Post>();
				for(let i in posts) {
					let post: Post = posts[i];
					post.author = user.toString();
					let friend = new User(friendInstance.get('username'), friendInstance.get('url'));
					if(await canReadPost(username, Privacy[post.privacy], friend)) res.push(post);
				}
				reply(res);
			}).catch(reply);
		} else {
			let res: Post[] = new Array<Post>();
			for(let i in posts) {
				let post: Post = posts[i];
				let author: User;
				try { post.author = (await utils.getUser(username)).toString(); }
				catch(e) { return reply(b.wrap(e)); }
				if(await canReadPost(username, Privacy[post.privacy])) res.push(post);
			}
			reply(res);
		}
	}).catch(reply);
}

// TODO: This function is really similar to serverGet: Factorise it
export function serverGetSingle(request: h.Request, reply: h.IReply) {
	let username = utils.getUsername(request);
	let instance: s.Sequelize;

	// Check if the user exists (the wrapper will return an error if not)
	try { instance = SequelizeWrapper.getInstance(username); } 
	catch(e) { return reply(b.notFound(e)); }

	instance.model('post').findById(request.params.timestamp, {
		raw: true
	}).then(async (post: Post) => {
		if(request.query.idToken) {
			instance.model('friend').findOne({
				where: { id_token: request.query.idToken }
			}).then(async (friendInstance: s.Instance<any>) => {
				if(!friendInstance) return reply(b.unauthorized('UNKNOWN_TOKEN'));
				let user = (await utils.getUser(username)).toString();
				let url = user + request.path;
				let token = friendInstance.get('signature_token');
				let params = utils.mergeObjects(request.query, request.params);
				let signature = utils.computeSignature(request.method, url, params, token);
				if(!utils.checkSignature(request.query.signature, signature)) {
					return reply(b.badRequest('WRONG_SIGNATURE'))
				}
				post.author = user.toString();
				let friend = new User(friendInstance.get('username'), friendInstance.get('url'));
				if(await canReadPost(username, Privacy[post.privacy], friend)) {
					return reply(post);
				} else {
					return reply(b.unauthorized());
				}
			}).catch(reply);
		} else {
			let author: User;
			try { post.author = (await utils.getUser(username)).toString(); }
			catch(e) { return reply(b.wrap(e)); }
			if(await canReadPost(username, Privacy[post.privacy])) {
				return reply(post);
			} else {
				reply(b.unauthorized());
			}
		}
	}).catch(reply);
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

function isFriend(username: string, friend: string | User): Promise<boolean> {
	return new Promise((ok, ko) => {
		let user: User;
		if(typeof friend === 'string') {
			user = new User(friend);
		} else {
			user = friend;
		}
		SequelizeWrapper.getInstance(username).model('friend').findOne({
			where: {
				username: user.username,
				url: user.instance
			}
		}).then((friend: s.Instance<any>) => {
			let status: string = friend.get('status');
			if(Status[status] === Status.accepted) {
				ok(true);
			}
			ok(false);
		}).catch(ko);
	});
}

function canReadPost(username: string, privacy: Privacy, friend?: User): Promise<boolean> {
	return new Promise<boolean>((ok, ko) => {
		switch(privacy) {
			case Privacy.public:
				return ok(true);
			case Privacy.friends:
				if(!friend) return ok(false);
				return isFriend(username, friend).then((isfriend) => {
					if(isfriend) return ok(true);
					else return ok(false);
				}).catch(ko);
			default:
				return ok(false);
		}
	});
}