import * as path from 'path';
import * as Hapi from 'hapi';
import * as sequelize from 'sequelize';
import * as Joi from 'joi';
import * as Boom from 'boom';

// Import the models
import {Friend, OutgoingRequests, Status, Response} from '../models/friends';
import {User} from '../models/users'

// Import the DB wrapper
import {SequelizeWrapper} from '../utils/sequelizeWrapper';

import {username} from '../utils/username';
import * as commons from '../utils/commons';

import * as utils from '../utils/serverUtils';
import * as friendUtils from '../utils/friendUtils';

const printit = require('printit');

const clientLog = printit({
	prefix: 'Client:Friends',
	date: true
});

const serverLog = printit({
	prefix: 'Server:Friends',
	date: true
});

export enum Type {
	friend,
	following
}

export function get(request: Hapi.Request, reply: Hapi.IReply) {
	clientLog.debug('Getting list of friends');
	let instance = SequelizeWrapper.getInstance(username);
	instance.model('friend').findAll({
		include: [{
			model: instance.model('profile'),
			attributes: ['description']
		}]
	}).then((users: sequelize.Instance<any>[]) => {
		let response = new Response();

		for(let i in users) {
			let user = users[i];
			let status: string = user.get('status');
			let username: string = new User(user.get('username'), user.get('url')).toString();
			// Ugly index so TypeScript doesn't yell at us
			let description: string = user['profile'].get('description');
			// If a friend request isn't of one of these 5 values, it will
			// be ignored
			switch(Status[status]) {
				case Status.accepted:
					response.addAccepted(new Friend(username, description));
					break;
				case Status.following:
					response.addFollowing(new Friend(username, description));
					break;
				case Status.incoming:
					response.addIncoming(new Friend(username, description));
					break;
				case Status.pending:
				case Status.declined:
					response.addSent(new OutgoingRequests(username, status));
					break;
			}
		}

		reply(response);
	}).catch((e) => {
		reply(Boom.wrap(e));
	});
}

export async function create(request: Hapi.Request, reply: Hapi.IReply) {
	let instance = SequelizeWrapper.getInstance(username);

	let user = new User(request.payload.to);
	let type: Type = Type[<string>request.payload.type];

	switch(type) {
		case Type.following:
			clientLog.debug('Following', user.toString());
			friendUtils.create(Status.following, user, username)
			.then(() => reply(null).code(204)).catch((e) => {
				if(e.isBoom) return reply(e);
				return utils.handleRequestError(user, e, clientLog, false, reply);
			});
			break;
		case Type.friend:
			clientLog.debug('Asking', user.toString(), 'to be our friend');
			utils.getUser(username).then((current) => {
				if(!current) throw Boom.notFound();
				return friendUtils.befriend(user, current);
			}).then(() => reply(null).code(204)).catch((e) => {
				if(e.isBoom) return reply(e);
				return utils.handleRequestError(user, e, clientLog, false, reply);
			});
			break;
		default:
			reply(Boom.badRequest());
	}
}

export function saveFriendRequest(request: Hapi.Request, reply: Hapi.IReply) {
	let username = utils.getUsername(request);
	let from = new User(request.payload.from);
	let tempToken = request.payload.tempToken;
	serverLog.debug('Got friend request from', from.toString(), 'with tempToken', tempToken);

	let instance: sequelize.Sequelize;
	// Check if the user exists (the wrapper will return an error if not)
	try { instance = SequelizeWrapper.getInstance(username); } 
	catch(e) {
		serverLog.debug('Couldn\'t find local user');
		return reply(Boom.notFound(e));
	}

	friendUtils.create(Status.incoming, from, username)
	.then(() => reply(null).code(200))
	.catch((e) => {
		if(e.isBoom) return reply(e);
		return reply(Boom.wrap(e))
	});
}


export let friendSchema = Joi.object({
	user: Joi.string().required().description('User (formatted as `username@instance-domain.tld`)'),
	description: Joi.string().description('User description')
}).label('Friend');

export let friendSentSchema = Joi.object({
	user: Joi.string().required().description('User (formatted as `username@instance-domain.tld`)'),
	status: Joi.string().required().valid('pending', 'declined').description('Request status (pending or refused)')
}).label('FriendSent');

export let friendsSchema = Joi.object({
	accepted: Joi.array().required().items(friendSchema).label('FriendsAccepted').description('Accepted friend requests'),
	incoming: Joi.array().required().items(friendSchema).label('FriendsReceived').description('Incoming friend requests'),
	sent: Joi.array().required().items(friendSentSchema).label('FriendsSent').description('Sent (pending) friend requests'),
	following: Joi.array().required().items(friendSchema).label('FriendsFollowings').description('People followed by the user'),
}).label('Friends');