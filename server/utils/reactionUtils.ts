import * as h from 'hapi';
import * as s from 'sequelize';

import * as path from 'path';

import * as request from 'request-promise-native';

import * as comments from '../controllers/comment';
import * as reactions from '../controllers/reaction';

import * as commons from './commons';
import * as utils from './serverUtils';
import {SequelizeWrapper} from './sequelizeWrapper';

import {User} from '../models/users';
import {Post, Privacy} from '../models/posts';
import {Comment} from '../models/comments';
import {Status} from '../models/friends';

import {VinimayError} from './vinimayError';

const log = require('printit')({
	date: true,
	prefix: 'comments utils'
});

export function createRemoteReaction(author: User, user: User, timestamp: number, idtoken, sigtoken): Promise<Comment> {
	return new Promise<Comment>((ok, ko) => {
		let params: any = {
			timestamp: timestamp,
			author: author.toString()
		};
		let reqPath = path.join('/v1/server/posts', timestamp.toString(), 'reactions');
		let url = user + reqPath;

		
		if(idtoken && sigtoken) {
			params.idToken = idtoken;
			let signature = utils.computeSignature('POST', url, params, sigtoken);
			url += '?idToken=' + idtoken
			url += '&signature=' + signature;
		}

		// We'll use HTTP only for localhost
		if(url.indexOf('localhost') < 0 && !commons.settings.forceHttp) url = 'https://' + url;
		else url = 'http://' + url

		log.debug('Requesting POST', url);
		
		let body = {
			author: author.toString()
		};
				
		request({
			method: 'POST',
			uri: url,
			headers: { 'Content-Type': 'application/json' },
			body: body,
			json: true,
			timeout: commons.settings.timeout
		})
		.then((response) => {
			log.debug('Created a reaction on', user.toString());
			ok(response);
		}).catch(ko);
	});
}

export function deleteRemoteReaction(postAuthor: User, tsPost: number, reactionAuthor: User, idtoken, sigtoken): Promise<null> {
	return new Promise<null>((resolve, reject) => {
		let params: any = {
			timestamp: tsPost,
			author: reactionAuthor.toString()
		};

		let reqPath = path.join('/v1/server/posts', tsPost.toString(), 'reactions');
		let url = postAuthor + reqPath;

		if(idtoken && sigtoken) {
			params.idToken = idtoken;
			let signature = utils.computeSignature('DELETE', url, params, sigtoken);
			url += '?idToken=' + idtoken
			url += '&signature=' + signature;
		}

		// We'll use HTTP only for localhost
		if(url.indexOf('localhost') < 0 && !commons.settings.forceHttp) url = 'https://' + url;
		else url = 'http://' + url

		log.debug('Requesting DELETE', url);

		request({
			method: 'DELETE',
			uri: url,
			headers: { 'Content-Type': 'application/json' },
			body: {
				author: reactionAuthor.toString()
			},
			json: true,
			timeout: commons.settings.timeout
		})
		.then((response) => {
			log.debug('Deleted a reaction on', postAuthor.toString());
			resolve(response);
		}).catch(reject);
	});
}