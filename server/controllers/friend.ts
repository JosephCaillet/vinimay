import * as h from 'hapi';
import * as s from 'sequelize';
import * as j from 'joi';

import {SequelizeWrapper} from '../utils/sequelizeWrapper';

export function get(request: h.Request, reply: h.IReply) {
	reply('Friends');
}

export let friendSchema = j.object({
	user: j.string().required().description('User (formatted as `username@instance-domain.tld`)'),
	description: j.string().description('User description')
}).label('Friend');

export let friendSentSchema = j.object({
	user: j.string().required().description('User (formatted as `username@instance-domain.tld`)'),
	status: j.string().required().valid('pending', 'refused').description('Request status (pending or refused)')
}).label('FriendSent');

export let friendsSchema = j.object({
	accepted: j.array().items(friendSchema).label('FriendsAccepted').description('Accepted friend requests'),
	received: j.array().items(friendSchema).label('FriendsReceived').description('Incoming friend requests'),
	sent: j.array().items(friendSentSchema).label('FriendsSent').description('Sent (pending) friend requests'),
}).label('Friends');