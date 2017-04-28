import * as h from 'hapi';
import * as s from 'sequelize';

import * as request from 'request';

import * as utils from './serverUtils';
import {SequelizeWrapper} from './sequelizeWrapper';

import {User} from '../models/users';
import {Post, Privacy} from '../models/posts';
import {Status} from '../models/friends';

import {VinimayError} from './vinimayError';

export function processPost(arg: Post | Post[], request: h.Request, username: string): Promise<Post | Post[] | undefined> {
	return new Promise<Post | Post[] | undefined>(async (ok, ko) => {
		let instance = SequelizeWrapper.getInstance(username);
		let res: Post | Post[] | undefined;
		try {
			if(request.query.idToken) {
				res = await processPostAuth(arg, request, username);
			} else {
				res = await processPostAnon(arg, request, username);
			}
		} catch(e) {
			ko(e);
		}
		ok(res);
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

function processPostAuth(arg: Post | Post[], request: h.Request, username: string): Promise<Post | Post[] | undefined> {
	return new Promise<Post | Post[] | undefined>(async (ok, ko) => {
		let instance = SequelizeWrapper.getInstance(username);
		let friendInstance: any;
		try {
			 friendInstance = await instance.model('friend').findOne({ where: {
				id_token: request.query.idToken,
				status: Status[Status.accepted]
			}});
		} catch(e) { return ko(e) }
		if(!friendInstance) return ko(new VinimayError('UNKNOWN_TOKEN'));
		let user: string;
		try { user = (await utils.getUser(username)).toString(); }
		catch(e) { return ko(e) }
		let url = user + request.path;
		let token = friendInstance.get('signature_token');
		let params = Object.assign(request.query, request.params);
		let signature = utils.computeSignature(request.method, url, params, token);
		if(!utils.checkSignature(request.query.signature, signature)) {
			ko(new VinimayError('WRONG_SIGNATURE'));
		}
		let friend = new User(friendInstance.get('username'), friendInstance.get('url'));
		if(arg instanceof Array) {
			let res: Array<Post> = new Array<Post>();
			for(let i in arg) {
				let post = arg[i];
				post.author = user.toString();
				if(await canReadPost(username, Privacy[post.privacy], friend)) {
					res.push(post);
				}
			}
			ok(res);
		} else {
			let post = arg;
			let author: User;
			try { post.author = (await utils.getUser(username)).toString() }
			catch(e) { return ko(e) }
			try {
				if(await canReadPost(username, Privacy[post.privacy]), friend) {
					ok(post);
				} else {
					ok();
				}
			} catch(e) {
				ko(e);
			}
		}
	});
}

function processPostAnon(arg: Post | Post[], request: h.Request, username: string): Promise<Post | Post[] | undefined> {
	return new Promise<Post | Post[] | undefined>(async (ok, ko) => {
		if(arg instanceof Array) {
			let res: Array<Post> = new Array<Post>();
			for(let i in arg) {
				let post = arg[i];
				let author: User;
				try { post.author = (await utils.getUser(username)).toString() }
				catch(e) { return ko(e) }
				try {
					if(await canReadPost(username, Privacy[post.privacy])) {
						res.push(post);
					}
				} catch(e) {
					ko(e);
				}
			}
			ok(res);
		} else {
			let post = arg;
			let author: User;
			try { post.author = (await utils.getUser(username)).toString() }
			catch(e) { return ko(e) }
			try {
				if(await canReadPost(username, Privacy[post.privacy])) {
					ok(post);
				} else { ok(); }
			} catch(e) {
				ko(e);
			}
		}
	});
}

function getRequestUrl(domain: string, path: string, params: Object): string {
	let url = domain + path
	if(Object.keys(params).length) url += '?'
	for(let key in params) {
		url += key + '=' + params[key] + '&';
	}
	return url.substr(0, url.length-1);
}

export function retrieveRemotePosts(source: User, idtoken?: string, sigtoken?: string): Promise<Post[]> {
	return new Promise<Post[]>((ok, ko) => {
		let params = { idToken: idtoken }
		let url = getRequestUrl(source.toString(), '/v1/server/post', params);
		
		console.log(url)
		//request.get(source.toString() + '/v1/server/posts')
	})
}