import * as h from 'hapi';
import * as b from 'boom';
import * as s from 'sequelize';
import * as j from 'joi';

import {SequelizeWrapper} from '../utils/sequelizeWrapper';

import {username} from '../utils/username';

export function get(request: h.Request, reply: h.IReply) {
	let instance = SequelizeWrapper.getInstance(username);
	
	instance.model('user').findOne({
		include: [{
			model: instance.model('profile'),
			attributes: ['description']
		}]
	}).then((user: s.Instance<any>) => {
		reply({
			username: user.get('username'),
			url: user.get('url'),
			description: user['profile'].get('description')
		})
	}).catch((e) => {
		reply(b.wrap(e));
	});
};

export function update(request: h.Request, reply: h.IReply) {
	reply('hello')
};

export let schema = j.object({
	username: j.string().required().description('User\'s username'),
	url: j.string().required().description('Domain of the instance the user is on'),
	description: j.string().description('Description (aka bio in some social medias) of the user')
}).label('User');