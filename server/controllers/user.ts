import * as h from 'hapi';
import * as s from 'sequelize';
import * as j from 'joi';

import {SequelizeWrapper} from '../utils/sequelizeWrapper';

const username = 'alice'; // TEMPORARY

module.exports.get = async function(request: h.Request, reply: h.IReply) {
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

module.exports.schema = j.object({
	username: j.string().required(),
	url: j.string().required(),
	description: j.string()
}).label('User');