import * as h from 'hapi';
import * as s from 'sequelize';
import * as j from 'joi';
import * as b from 'boom';

import {Post, Privacy} from '../models/posts'

import {SequelizeWrapper} from '../utils/sequelizeWrapper';

const username = 'alice'; // TEMPORARY

export function get(request: h.Request, reply: h.IReply) {
	let instance = SequelizeWrapper.getInstance(username);
	let options = <s.FindOptions>getOptions(request.query);
	// We cast directly as post, so we don't need getters and setters
	options.raw = true;

	instance.model('post').findAll(options).then((posts: Post[]) => {
		instance.model('user').findOne().then((user: s.Instance<any>) => {
			for(let i in posts) {
				let post = posts[i];
				post.author = username + '@' + user.get('url');
			}
			reply(posts);
		}).catch(reply);
	}).catch(reply);
}

export function getSingle(request: h.Request, reply: h.IReply) {
	let instance = SequelizeWrapper.getInstance(username);
	let user = request.params.user.split('@');

	try {
		instance = SequelizeWrapper.getInstance(user[0]);
	} catch(e) {
		// If the user doesn't exist, we return an error
		return reply(e);
	}

	instance.model('post').findById(request.params.timestamp).then((res: s.Instance<Post>) => {
		let post = res.get({plain: true});
		instance.model('user').findOne().then((user: s.Instance<any>) => {
			post.author = username + '@' + user.get('url');
			reply(post);
		}).catch(reply);
	}).catch(reply);
}

export function create(request: h.Request, reply: h.IReply) {
	// Javascript's timestamp is in miliseconds. We want it in seconds.
	let ts = Math.round((new Date()).getTime()/1000);
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
	let user = request.params.user.split('@');

	let instance: s.Sequelize;

	try {
		instance = SequelizeWrapper.getInstance(user[0]);
	} catch(e) {
		// If the user doesn't exist, we return an error
		return reply(e);
	}

	instance.model('user').findOne().then((res: s.Instance<any>) => {
		// Check if instance domain matches
		if(res.get('url').localeCompare(user[1])) {
			return reply(b.unauthorized);
		}
		// Run the query
		instance.model('post').destroy({ where: {
			creationTs: request.params.timestamp
		}}).then(() => {
			reply(null).code(204);
		}).catch(reply);
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