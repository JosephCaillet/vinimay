import * as path from 'path';

import * as Boom from 'boom';
import * as request from 'request-promise-native';

import * as comments from '../controllers/comment';
import * as reactions from '../controllers/reaction';

import * as commons from './commons';
import * as utils from './serverUtils';
import {SequelizeWrapper} from './sequelizeWrapper';

import {Status} from '../models/friends';
import {User} from '../models/users';

import {VinimayError} from './vinimayError';


export function exists(user: User, username: string): Promise<boolean> {
	let instance = SequelizeWrapper.getInstance(username);

	return new Promise<boolean>((resolve, reject) => {
		instance.model('friend').count({where: {
			username: user.username,
			url: user.instance
		}}).then((count) => resolve(!!count)).catch(reject);
	});
}

export function create(status: Status, user: User, username: string, token?: string): Promise<null> {
	let instance = SequelizeWrapper.getInstance(username);

	return new Promise<null>((resolve, reject) => {
		exists(user, username).then((exists) => {
			if(exists) throw Boom.conflict();
			return getRemoteUserData(user);
		}).then((user) => {
			return instance.model('profile').create({
				username: user.username,
				url: user.url,
				description: user.description
			});
		}).then(() => {
			let friend: any = {
				username: user.username,
				url: user.instance,
				status: Status[status]
			};
			if(token) friend.id_token = token;
			return instance.model('friend').create(friend);
		}).then(() => {
			resolve();
		}).catch(reject);
	})
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