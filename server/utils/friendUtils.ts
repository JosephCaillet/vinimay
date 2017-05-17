import * as path from 'path';
import * as crypto from 'crypto';

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


export function getAll(user: User, username: string): Promise<sequelize.Instance<any>> {
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
			return getAll(user, username);
		}).then((friend) => {
			if(friend) {
				log.debug('Friend exists, upgrading it');
				return upgrade(friend, status);
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
				if(token) friend.id_token = token;
				log.debug('Creating the friend');
				return instance.model('friend').create(friend);
			} else {
				log.debug('Skipping creation')
				return Promise.resolve();
			}
		}).then(() => resolve(description)).catch(reject);
	})
}

interface UpgradeRet {
    upgraded: boolean,
	instance: sequelize.Instance<any>
};

export function upgrade(user: sequelize.Instance<any>, newStatus: Status): Promise<UpgradeRet> {
	return new Promise<UpgradeRet>((resolve, reject) => {
		let friendStatus: Status = Status[<string>user.get('status')];

		// If a friend exist, we check its status. We throw a conflict
		// error if its already at the status we want to set it to,
		// or if its status is "friend". Else we upgrade it to the given
		// status.
		if(newStatus === friendStatus 
			|| friendStatus === Status.accepted
			|| friendStatus === Status.pending) {
			log.debug('Friend already exists with status', Status[friendStatus] + ',', 'aborting without creating nor updating');
			throw Boom.conflict();
		}

		user.set('status', Status[newStatus]);
		user.save().then((user) => {
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

function getRemoteUserData(user: User): request.RequestPromise {
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