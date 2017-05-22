import * as path from 'path';
import * as crypto from 'crypto';

import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as request from 'request-promise-native';
import * as sequelize from 'sequelize';

import * as comments from '../controllers/comment';
import * as reactions from '../controllers/reaction';

import * as commons from './commons';
import * as utils from './serverUtils';
import {SequelizeWrapper} from './sequelizeWrapper';

import {Status} from '../models/friends';
import {User} from '../models/users';

import {VinimayError} from './vinimayError';

const log = require('printit')({
	prefix: 'Utils:Friends',
	date: true
});

interface AcceptationParams {
	idDH: crypto.DiffieHellman,
	sigDH: crypto.DiffieHellman,
	tempToken: string,
	idToken: string,
	sigToken: string
}

interface OngoingAcceptations {
	[user: string]: AcceptationParams
}

const acceptations: OngoingAcceptations = {};

export function getFriend(user: User, username: string): Promise<sequelize.Instance<any>> {
	let instance = SequelizeWrapper.getInstance(username);

	return new Promise<sequelize.Instance<any>>((resolve, reject) => {
		instance.model('friend').findOne({where: {
			username: user.username,
			url: user.instance
		}}).then((friend: sequelize.Instance<any>) => resolve(friend)).catch(reject);
	});
}

export function create(status: Status, user: User, username: string, token?: string): Promise<string | null> {
	log.debug('Creating row for', user.toString(), 'with status', Status[status]);
	let instance = SequelizeWrapper.getInstance(username);

	return new Promise<string | null>((resolve, reject) => {
		let description: string | null = null;
		utils.getUser(username).then((current) => {
			if(current.username === user.username && current.instance === user.instance) {
				log.debug('User is trying to follow/befriend itself');
				throw Boom.forbidden();
			}
			return getFriend(user, username);
		}).then((friend) => {
			if(friend) {
				log.debug('Friend exists, upgrading it');
				if(token) log.debug('Using token', token, 'for upgrade');
				return upgrade(friend, status, false, token);
			}
			return getRemoteUserData(user);
		}).then((userData) => {
			// Check if we resolved from save() or getRemoteUserData()
			if(!userData.upgraded) {
				description = userData.description;
				return profileExists(user, username).then((exists) => {
					if(exists) return Promise.resolve(true);
					log.debug('Creating the profile');
					return instance.model('profile').create({
						username: userData.username,
						url: userData.url,
						description: userData.description
					});
				})
			} else {
				log.debug('Skipping creation')
				// If we only have to update the user in DB, return without
				// doing anything else
				return Promise.resolve();
			}
		}).then((created) => {
			if(created) {
				let friend: any = {
					username: user.username,
					url: user.instance,
					status: Status[status]
				};
				if(token) {
					log.debug('Creating the friend request with token', token);
					friend.id_token = token;
				} else {
					log.debug('Creating a row with no token');
				}
				return instance.model('friend').create(friend);
			} else {
				log.debug('Skipping creation')
				return Promise.resolve();
			}
		}).then((friend) => {
			if(friend) log.debug('Friend request created with token', friend.get('id_token'));
			return resolve(description)
		}).catch(reject);
	})
}

interface UpgradeRet {
    upgraded: boolean,
	instance: sequelize.Instance<any>
};

export function upgrade(user: sequelize.Instance<any>, newStatus: Status, force?: boolean, token?: string): Promise<UpgradeRet> {
	return new Promise<UpgradeRet>((resolve, reject) => {
		let friendStatus: Status = Status[<string>user.get('status')];

		// If a friend exist, we check its status. We throw a conflict
		// error if its already at the status we want to set it to,
		// or if its status is "friend". Else we upgrade it to the given
		// status. We can also force the upgrade (for example if we want to move
		// a "pending" friend request to "accepted").
		if((newStatus === friendStatus 
			|| friendStatus === Status.accepted
			|| friendStatus === Status.pending) && !force) {
			log.debug('Friend already exists with status', Status[friendStatus] + ',', 'aborting without creating nor updating');
			throw Boom.conflict();
		}

		user.set('status', Status[newStatus]);
		if(token) user.set('id_token', token);
		user.save().then((user) => {
			let friend = new User(user.get('username'), user.get('url'));
			log.debug('Upgraded', friend.toString(), 'with status', user.get('status'), 'and', user.get('id_token') || 'nothing', 'as token');
			// Wrap the result so we can know it came from this function
			resolve({
				upgraded: true,
				instance: user
			})
		})
	});
}

export function profileExists(user: User, username: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		let instance = SequelizeWrapper.getInstance(username);
		instance.model('profile').count({where: {
			username: user.username,
			url: user.instance
		}}).then((count) => resolve(!!count)).catch(reject);
	});
}

export function befriend(user: User, currentUser: User): Promise<string | null> {
	return new Promise<string | null>((resolve, reject) => {
		let url = path.join(user.toString(), '/v1/server/friends');
		
		let protocol: string;
		if(commons.settings.forceHttp || url.indexOf('localhost') > -1) protocol = 'http://';
		else protocol = 'https://';
		
		url = protocol + url;
		
		// token is a 64-byte long alphanumeric string (so 32-byte long in hexa)
		let token = crypto.randomBytes(32).toString('hex');

		let description: string | null = null;
		
		// Store the request on our side
		return create(Status.pending, user, currentUser.username, token)
		.then((desc) => {
			description = desc;
			log.debug('User description is', description)
			return request({
				method: 'POST',
				uri: url,
				headers: { 'Content-Type': 'application/json' },
				body: {
					from: currentUser.toString(),
					tempToken: token
				},
				json: true,
				timeout: commons.settings.timeout
			});
		}).then(() => resolve(description)).catch(reject);
	});
}

export function getRemoteUserData(user: User): request.RequestPromise {
	let url = path.join(user.instance, '/v1/client/me');

	let protocol: string;
	if(commons.settings.forceHttp || url.indexOf('localhost') > -1) protocol = 'http://';
	else protocol = 'https://';
	
	url = protocol + url;

	return request.get(url, {
		json: true,
		timeout: commons.settings.timeout
	});
}

export async function acceptFriendRequest(user: User, username: string): Promise<null> {
	let friend = await getFriend(user, username);
	let tempToken = friend.get('id_token');
	if(acceptations[tempToken]) throw Boom.conflict();
	acceptations[tempToken] = <AcceptationParams>{};
	let acceptation = acceptations[tempToken];

	return new Promise<null>((resolve, reject) => {
		log.debug('Accepting friend request from', user.toString());

		acceptation.idDH = crypto.createDiffieHellman(256);
		acceptation.sigDH = crypto.createDiffieHellman(256);
		
		let id = {
			generator: acceptation.idDH.getGenerator('hex'),
			prime: acceptation.idDH.getPrime('hex'),
			mod: acceptation.idDH.generateKeys('hex')
		}
		
		let sig = {
			generator: acceptation.sigDH.getGenerator('hex'),
			prime: acceptation.sigDH.getPrime('hex'),
			mod: acceptation.sigDH.generateKeys('hex')
		}

		let protocol: string
		let url = path.join(user.toString(), '/v1/server/friends');
		if(commons.settings.forceHttp || url.indexOf('localhost') > -1) protocol = 'http://';
		else protocol = 'https://';

		let friendInstance: sequelize.Instance<any>;

		getFriend(user, username).then((friend) => {
			friendInstance = friend;
			if(!friendInstance || Status[<string>friendInstance.get('status')] !== Status.incoming) {
				log.debug('Friend request does not exist');
				delete acceptations[acceptation.tempToken];
				throw Boom.notFound();
			}
			acceptation.tempToken = friendInstance.get('id_token')
			let body = {
				step: 1,
				tempToken: acceptation.tempToken,
				idTokenDh: id,
				sigTokenDh: sig,
			}
			log.debug('Sending step 1');
			return request({
				method: 'PUT',
				url: protocol + url,
				body: body,
				json: true,
				headers: { 'Content-Type': 'application/json' },
				timeout: commons.settings.timeout
			});
		}).then((keys) => {
			log.debug('Got keys from', user.toString());
			try {
				acceptation.idToken = acceptation.idDH.computeSecret(keys.idTokenMod, 'hex', 'hex');
				acceptation.sigToken = acceptation.sigDH.computeSecret(keys.sigTokenMod, 'hex', 'hex');
			} catch(e) {
				delete acceptations[acceptation.tempToken];
				return reject(e);
			}

			log.debug('Computed idToken', acceptation.idToken, 'for', user.toString());
			log.debug('Computed signature token', acceptation.sigToken, 'for', user.toString());

			let body: any = {
				step: 2,
				tempToken: acceptation.tempToken,
				idToken: acceptation.idToken
			}

			body.signature = utils.computeSignature('PUT', url, body, acceptation.sigToken);

			return request({
				method: 'PUT',
				url: protocol + url,
				body: body,
				json: true,
				headers: { 'Content-Type': 'application/json' },
				timeout: commons.settings.timeout
			});
		}).then(() => {
			return upgrade(friendInstance, Status.accepted, true)
		}).then((upgraded) => {
			// Update the tokens
			let friendInstance = upgraded.instance;
			friendInstance.set('id_token', acceptation.idToken);
			friendInstance.set('signature_token', acceptation.sigToken);
			return friendInstance.save();
		}).then((updated) => {
			delete acceptations[acceptation.tempToken];
			return resolve();
		}).catch(e => {
			delete acceptations[acceptation.tempToken];
			return reject(e);
		});
	});
}

export function handleStepOne(username: string, payload: any): Promise<{idTokenMod: string, sigTokenMod: string}> {
	return new Promise<{idTokenMod: string, sigTokenMod: string}>(async (resolve, reject) => {
		let friendInstance;
		try {
			friendInstance = await utils.getFriendByToken(username, payload.tempToken);
		} catch(e) {
			log.warn('Could not retrieve friend for token', payload.tempToken);
			return reject(e);
		}
		let friend = new User(friendInstance.username, friendInstance.url);
		
		if(acceptations[payload.tempToken]) {
			delete acceptations[payload.tempToken];
			return reject(Boom.conflict());
		}
		log.debug('Received acceptation data (step 1) from', friend.toString());
		
		acceptations[payload.tempToken] = <AcceptationParams>{};
		let acceptation = acceptations[payload.tempToken];
		acceptation.tempToken = payload.tempToken;

		try {
			acceptation.idDH = crypto.createDiffieHellman(payload.idTokenDh.prime, 'hex', payload.idTokenDh.generator, 'hex');
			acceptation.sigDH = crypto.createDiffieHellman(payload.sigTokenDh.prime, 'hex', payload.sigTokenDh.generator, 'hex');
			acceptation.idDH.generateKeys();
			acceptation.sigDH.generateKeys();
			acceptation.idToken = acceptation.idDH.computeSecret(payload.idTokenDh.mod, 'hex', 'hex');
			acceptation.sigToken = acceptation.sigDH.computeSecret(payload.sigTokenDh.mod, 'hex', 'hex');
		} catch(e) {
			delete acceptations[acceptation.tempToken];
			return reject(e);
		}

		log.debug('Computed idToken', acceptation.idToken, 'for', friend.toString());
		log.debug('Computed signature token', acceptation.sigToken, 'for', friend.toString());

		resolve({
			idTokenMod: acceptation.idDH.generateKeys('hex'),
			sigTokenMod: acceptation.sigDH.generateKeys('hex')
		});
	});
}

export function handleStepTwo(user: User, payload: any): Promise<null> {
	return new Promise<null>(async (resolve, reject) => {
		let friendInstance;
		try {
			friendInstance = await utils.getFriendByToken(user.username, payload.tempToken);
		} catch(e) {
			log.warn('Could not retrieve friend for token', payload.tempToken);
			return reject(e);
		}
		let friend = new User(friendInstance.username, friendInstance.url);

		if(!acceptations[payload.tempToken]){
			log.warn('Could not find previously in-memory stored data on the ongoing acceptation');
			return reject(Boom.notFound());
		 }
		log.debug('Received acceptation data (step 2) from', friend.toString());

		let acceptation = acceptations[payload.tempToken];

		// Check idToken
		if(payload.idToken !== acceptation.idToken){
			log.warn('idToken did not match');
			delete acceptations[acceptation.tempToken];
			return reject(Boom.expectationFailed('idToken not matching', {field: 'idToken'}));
		}

		// Check signature
		let params = Object.assign({}, payload);
		let signature = payload.signature;
		delete params.signature;
		let url = path.join(user.toString(), '/v1/server/friends');
		let computedSignature = utils.computeSignature('PUT', url, params, acceptation.sigToken);

		if(computedSignature !== signature) {
			log.warn('Signature did not match');
			delete acceptations[acceptation.tempToken];
			return reject(Boom.expectationFailed('Signature not matching', {field: 'signature'}));
		}

		log.debug('All data matching, updating the friend request from', friend.toString(), '(tempToken = ', acceptation.tempToken + ')');
		SequelizeWrapper.getInstance(user.username).model('friend').findOne({ where: {
			id_token: acceptation.tempToken
		}}).then((friendInstance: sequelize.Instance<any>) => {
			// Update the status
			return upgrade(friendInstance, Status.accepted, true)
		}).then((upgraded) => {
			// Update the tokens
			let friendInstance = upgraded.instance;
			friendInstance.set('id_token', acceptation.idToken);
			friendInstance.set('signature_token', acceptation.sigToken);
			return friendInstance.save();
		}).then((updated) => {
			delete acceptations[acceptation.tempToken];
			return resolve();
		}).catch(e => {
			delete acceptations[acceptation.tempToken];
			return reject(e);
		})
	});
}

// Removes the friend request on the requesting server and sets it as declined on
// the requested server (except for pending)
export function declineFriendRequest(user: User, username: string): Promise<null> {
	return new Promise<null>(async (resolve, reject) => {
		log.debug('Starting friendship decline/cancel process for', user.toString());
		let friend: sequelize.Instance<any>;
		try {
			friend = await getFriend(user, username);
		} catch(e) {
			log.warn('Could not find friend request for', user.toString());
			return reject(Boom.notFound());
		}

		let protocol: string
		let url = path.join(user.toString(), '/v1/server/friends');
		if(commons.settings.forceHttp || url.indexOf('localhost') > -1) protocol = 'http://';
		else protocol = 'https://';

		let statuses = [
			Status[Status.pending],
			Status[Status.incoming],
			Status[Status.accepted]
		];

		if(statuses.indexOf(friend.get('status')) === -1) {
			log.warn('Trying to decline a non existing request');
			return reject(Boom.notFound());
		}

		let body: any = {
			token: friend.get('id_token')
		}

		if(friend.get('status') === Status[Status.accepted]) {
			log.debug('We are cancelling a relationship and signing the request');
			// If we're cancelling an existing relationship, we have to sign the
			// request
			body.signature = utils.computeSignature('DELETE', url, body, friend.get('signature_token'));
		}

		request({
			method: 'DELETE',
			url: protocol + url,
			body: body,
			json: true,
			headers: { 'Content-Type': 'application/json' },
			timeout: commons.settings.timeout
		}).then(() => {
			return friend.destroy();
		}).then(() => resolve()).catch(reject);
	});
}