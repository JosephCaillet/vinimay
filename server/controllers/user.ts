import * as h from 'hapi';
import * as s from 'sequelize';
import * as j from 'joi';

import {SequelizeWrapper} from '../utils/sequelizeWrapper';

const username = 'alice'; // TEMPORARY

export function get(request: h.Request, reply: h.IReply) {
	SequelizeWrapper.getInstance(username).model('profile').findOne({
		where: {
			username: username,
			url: 'localhost'
		}
	}).then((user: s.Instance<any>) => {
		reply({
			username: user.get('username'),
			url: user.get('url'),
			description: user.get('description')
		})
	}).catch((e) => {
		reply(e);
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