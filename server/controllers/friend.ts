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
			.then((description) => {
				let res: any = {
					user: user.toString()
				};
				if(description) res.description = description;
				return commons.checkAndSendSchema(res, friendSchema, clientLog, reply);
			}).catch((e) => {
				if(e.isBoom) return reply(e);
				return utils.handleRequestError(user, e, clientLog, false, reply);
			});
			break;
		case Type.friend:
			clientLog.debug('Asking', user.toString(), 'to be our friend');
			utils.getUser(username).then((current) => {
				if(!current) throw Boom.notFound();
				return friendUtils.befriend(user, current);
			}).then((description) => {
				let res: any = {
					user: user.toString()
				};
				if(description) res.description = description;
				return commons.checkAndSendSchema(res, friendSchema, clientLog, reply)
			}).catch((e) => {
				if(e.isBoom) return reply(e);
				return utils.handleRequestError(user, e, clientLog, false, reply);
			});
			break;
		default:
			reply(Boom.badRequest());
	}
}

export function updateRequest(request: Hapi.Request, reply: Hapi.IReply) {
	let friend = new User(request.params.user)
	if(request.payload.accepted) {
		clientLog.debug('Accepting friend request from', friend.toString());
		friendUtils.acceptFriendRequest(friend, username)
		.then(() => reply(null).code(204)).catch((e) => {
			if(e.isBoom) return reply(e);
			else return utils.handleRequestError(friend, e, clientLog, false, reply);
		});
	} else if(!request.payload.accepted && typeof request.payload.accepted === 'boolean') {
		friendUtils.declineFriendRequest(friend, username)
		.then(() => reply(null).code(204)).catch((e) => {
			if(e.isBoom) return reply(e);
			else return utils.handleRequestError(friend, e, clientLog, false, reply);
		});
	} else {
		return reply(Boom.badRequest());
	}
}

export async function accept(request: Hapi.Request, reply: Hapi.IReply) {
	let username = utils.getUsername(request);
	let user = await utils.getUser(username);
	let friendInstance;
	try {
		friendInstance = await utils.getFriendByToken(username, request.payload.tempToken);
	} catch(e) {
		serverLog.warn('Could not retrieve friend for token', request.payload.tempToken);
		return reply(Boom.notFound());
	}
	let friend = new User(friendInstance.username, friendInstance.url);

	switch(request.payload.step) {
		case 1:
			friendUtils.handleStepOne(username, request.payload)
			.then((mods) => commons.checkAndSendSchema(mods, modsSchema, serverLog, reply))
			.catch((e) => {
				if(e.isBoom) return reply(e);
				else return reply(Boom.wrap(e));
			});
			break;
		case 2:
			friendUtils.handleStepTwo(user, request.payload)
			.then(() => reply(null).code(204))
			.catch((e) => {
				if(e.isBoom) return reply(e);
				else return reply(Boom.wrap(e));
			});
			break;
	}
}

export function decline(request: Hapi.Request, reply: Hapi.IReply) {
	let username = utils.getUsername(request);
	SequelizeWrapper.getInstance(username).model('friend').findOne({where: {
		id_token: request.payload.token
	}}).then((friend: sequelize.Instance<any>): any => {
		let statuses = [
			Status[Status.pending],
			Status[Status.incoming],
			Status[Status.accepted]
		];

		if(!friend || statuses.indexOf(friend.get('status')) === -1) {
			serverLog.warn('Could not retrieve friend for token', request.payload.token);
			throw Boom.notFound();
		}

		let user = new User(friend.get('username'), friend.get('url'));

		if(friend.get('status') === Status[Status.incoming]) {
			serverLog.debug('Removing the friend request from', user.toString());
			return friend.destroy();
		} else {
			// If we're cancelling an existing relationship, we have to sign the
			// request
			if(friend.get('status') === Status[Status.accepted]) {
				if(!request.payload.signature) {
					serverLog.debug('No signature provided');
					throw Boom.badRequest();
				}

				let url = username + '@' + request.info.host + request.url.path;
				let signature = utils.computeSignature('DELETE', url, {
					token: request.payload.token
				}, friend.get('signature_token'));

				if(signature !== request.payload.signature) {
					serverLog.debug('Signature mismatch');
					throw Boom.unauthorized('WRONG_SIGNATURE');
				}
			}
			serverLog.debug('Setting friend status to declined and removing tokens');
			friend.set('id_token', null);
			friend.set('signature_token', null);
			friend.set('status', Status[Status.declined]);
			return friend.save();
		}
	}).then(() => reply(null).code(204))
	.catch((e) => {
		if(e.isBoom) return reply(e);
		else return reply(Boom.wrap(e));
	});
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

	friendUtils.create(Status.incoming, from, username, tempToken)
	.then((description) => {
		let res: any = {
			user: from.toString()
		};
		if(description) res.description = description;
		return commons.checkAndSendSchema(res, friendSchema, serverLog, reply);
	})
	.catch((e) => {
		if(e.isBoom) return reply(e);
		return reply(Boom.wrap(e))
	});
}


export let friendSchema = Joi.object({
	user: commons.user.required().description('User (formatted as `username@instance-domain.tld`)'),
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

export let acceptationSchema = Joi.object({
	step: Joi.number().valid(1, 2).required().description('The identifier of the step'),
	tempToken: Joi.string().alphanum().required().description('The temporary token used during the transaction'),
	idTokenDh: Joi.object({
		generator: Joi.string().alphanum().required().description('The Diffie-Hellman generator'),
		prime: Joi.string().alphanum().required().description('The Diffie-Hellman prime number'),
		mod: Joi.string().alphanum().required().description('The Diffie-Hellman modulo')
	}).when('step', { is: 1, then: Joi.required(), otherwise: Joi.forbidden() }).label('idToken DH').description('Diffie-Hellman for the idToken'),
	sigTokenDh: Joi.object({
		generator: Joi.string().alphanum().required().description('The Diffie-Hellman generator'),
		prime: Joi.string().alphanum().required().description('The Diffie-Hellman prime number'),
		mod: Joi.string().alphanum().required().description('The Diffie-Hellman modulo')
	}).when('step', { is: 1, then: Joi.required(), otherwise: Joi.forbidden() }).label('idToken DH').description('Diffie-Hellman for the signature token'),
	idToken: Joi.string().alphanum().when('step', { is: 2, then: Joi.required(), otherwise: Joi.forbidden() }).description('The computed idToken'),
	signature: Joi.string().alphanum().when('step', { is: 2, then: Joi.required(), otherwise: Joi.forbidden() }).description('The signature computed with the computed signature token')
}).label('Friend acceptation');

export let modsSchema = Joi.object({
	idTokenMod: Joi.string().alphanum().required().description('Key for idToken'),
	sigTokenMod: Joi.string().alphanum().required().description('Key for signature token')
})