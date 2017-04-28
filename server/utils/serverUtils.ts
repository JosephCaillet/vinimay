import * as h from 'hapi';
import * as s from 'sequelize';

import * as crypto from 'crypto';

import {User} from '../models/users';
import {SequelizeWrapper} from './sequelizeWrapper';

const log = require('printit')({
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

export function computeSignature(method: string, url: string, parameters, token: string): string {
	let params = '';
	for(let param in parameters) {
		if(param.localeCompare('signature')) {
			params += param + '=' + parameters[param] + '&';
		}
	}
	// Removing the trailing '&'
	params = params.substr(0, params.length-1);
	
	let toSign = [method.toUpperCase(), url, params].join('&');
	toSign = encodeURIComponent(toSign);
	
	let signature = crypto.createHmac("sha256", token)
	.update(toSign)
	.digest("hex");

	log.debug('Signature for ' + method.toUpperCase() + ' ' + url + ': ' +signature);

	return signature;
}

export function checkSignature(received: string, computed: string): boolean {
	return !computed.localeCompare(received);
}