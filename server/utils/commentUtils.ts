import * as h from 'hapi';
import * as s from 'sequelize';

import * as path from 'path';

import * as request from 'request-promise-native';

import * as comments from '../controllers/comment';
import * as reactions from '../controllers/reaction';

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

export function retrieveRemoteComments(source: User, timestamp: string, params: any, idtoken?: string, sigtoken?: string): Promise<Comment[]> {
	return new Promise<Comment[]>((ok, ko) => {
		let params: any = {
			timestamp: timestamp
		};
		let reqPath = path.join('/v1/server/posts', timestamp.toString(), 'comments');
		let url = source + reqPath;

		if(idtoken && sigtoken) {
			params.idToken = idtoken;
			let signature = utils.computeSignature('GET', url, params, sigtoken);
			url += '?idToken=' + idtoken
			url += '&signature=' + signature;
		}

		// We'll use HTTP only for localhost
		if(url.indexOf('localhost') < 0) url = 'https://' + url;
		else url = 'http://' + url

		log.debug('Requesting GET ' + url);

		request.get(url, {json: true})
		.then((response) => {
			log.debug('Received ' + response.length + ' comments from ' + source);
			ok(response);
		}).catch(ko);
	})
}

export function createRemoteComment(author: User, user: User, timestamp: string, content: string, idtoken, sigtoken): Promise<Comment> {
	return new Promise<Comment>((ok, ko) => {
		let params: any = {
			timestamp: parseInt(timestamp),
			content: content,
			author: author.toString(),
		};
		let reqPath = path.join('/v1/server/posts', timestamp.toString(), 'comments');
		let url = user + reqPath;

		
		if(idtoken && sigtoken) {
			params.idToken = idtoken;
			let signature = utils.computeSignature('POST', url, params, sigtoken);
			url += '?idToken=' + idtoken
			url += '&signature=' + signature;
		}

		// We'll use HTTP only for localhost
		if(url.indexOf('localhost') < 0) url = 'https://' + url;
		else url = 'http://' + url

		log.debug('Requesting POST', url);
		
		let body = {
			author: author.toString(),
			content: content
		};
				
		request({
			method: 'POST',
			uri: url,
			headers: { 'Content-Type': 'application/json' },
			body: body,
			json: true
		})
		.then((response) => {
			log.debug('Created a comment on', user.toString());
			ok(response);
		}).catch(ko);
	});
}