import * as h from 'hapi';
import * as b from 'boom';
import * as s from 'sequelize';
import * as r from 'request-promise-native/errors';

import * as crypto from 'crypto';

import * as Friend from '../models/friends';

import {VinimayError} from './vinimayError';
import {User} from '../models/users';
import {SequelizeWrapper} from './sequelizeWrapper';

const log = require('printit')({
	prefix: 'Utils:Server',
	date: true
});

export function getUsername(request: h.Request): string {
	// Isolate the base64-encoded part
	let basic = request.headers.authorization.split(' ')[1];
	// Decode, then isolate the username
	return new Buffer(basic, 'base64').toString('ascii').split(':')[0]
}

export function getUser(username: string): Promise<User> {
	return new Promise((ok, ko) => {
		SequelizeWrapper.getInstance(username).model('user').findOne()
		.then((user: s.Instance<any>) => {
			ok(new User(user.get('username'), user.get('url')))
		}).catch(ko);
	});
}

export function getFriendByToken(username: string, idtoken: string): Promise<any> {
	return new Promise((ok, ko) => {
		SequelizeWrapper.getInstance(username).model('friend').findOne({where: {
			id_token: idtoken
		}, raw: true})
		.then((user: s.Instance<any>) => {
			if(user) ok(user);
			else throw new VinimayError('UNKNOWN_TOKEN');
		}).catch(ko);
	});
}

export function computeSignature(method: string, url: string, parameters, token: string): string {
	let params = '';

	// We can't sort an object on its properties' names, so we create an array from it
	let sortable: any[] = [];
	for (let param in parameters) {
	    sortable.push([param, parameters[param]]);
	}

	// Sort the array
	sortable.sort((a, b) => {
		if(a[0] < b[0]) return -1
		if(a[0] > b[0]) return 1
		return 0;
	})

	// Build the reference string
	for(let i in sortable) {
		let param = sortable[i];
		if(param[0].localeCompare('signature')) {
			params += param[0] + '=' + param[1] + '&';
		}
	}
	// Removing the trailing '&'
	params = params.substr(0, params.length-1);
	
	let toSign = [method.toUpperCase(), url, params].join('&');
	log.debug('String to sign:', toSign);
	toSign = encodeURIComponent(toSign);

	let signature = crypto.createHmac("sha256", token)
	.update(toSign)
	.digest("hex");

	log.debug('Signature for ' + method.toUpperCase() + ' ' + url + ': ' +signature + ' (using token ' + token + ')');

	return signature;
}

export function checkSignature(received: string, computed: string): boolean {
	return !computed.localeCompare(received);
}

export function getGetRequestUrl(user: User, path: string, params: any, sigtoken?: string): string {
	let url = user + path;
	let hasParams: boolean = !!(Object.keys(params).length || (params.idToken && sigtoken));
	let signature: string = '';
	if(params.idToken && sigtoken) {
		signature = computeSignature('GET', user + path, params, sigtoken);
	}
	if(hasParams) url += '?'
	for(let key in params) {
		url += key + '=' + params[key] + '&';
	}
	if(params.idToken && sigtoken) {
		url += 'signature=' + signature;
	} else if(hasParams) {
		url = url.substr(0, url.length-1);
	}
	return url;
}


// Prints the error, sends it to the user if necessary
export function handleRequestError(friend: User, e: Error, log: any, looped?: boolean, reply?: h.IReply) {
	let code: number = 500; // Default value
	let message: string = ''; // Default value
	if(e instanceof r.RequestError) {
		code = e.error.code;
	} else if(e instanceof r.StatusCodeError) {
		code = e.statusCode;
	}
	
	if(e instanceof r.StatusCodeError && e.statusCode === 400) {
		message = 'This usually means the API was badly implemented either on the current instance or on the friend\'s.';
	} else if(e instanceof r.StatusCodeError && e.statusCode === 401) {
		message = 'This can happen because of a bad implementation of the Vinimay API on either side, or because of an instance domain mismatch between the two instances\' databases.';
	} else if(e instanceof r.StatusCodeError && e.statusCode === 500) {
		message = 'This can happen because of a bug in the remote instance\'s code or a bad implentation of the Vinimay API on its side.'
	} else if(e instanceof r.StatusCodeError) {
		// Some errors are thrown willingly to be sent to the client
		if(reply && !looped) return reply(b.create(e.statusCode));
		else return;
	} else if(!(e instanceof r.RequestError)) {
		log.error(e);
		if(reply && !looped) return reply(b.wrap(e));
		else return;
	}

	// Default behaviour
	if(code) log.warn('Got a ' + code + ' when querying ' + friend)
	else log.error(e);
	if(message.length) log.warn(message);
	if(reply && !looped) reply(b.serverUnavailable());
}