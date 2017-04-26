import * as h from 'hapi';
import * as s from 'sequelize';
import * as j from 'joi';

// Import the models
import {Friend, OutgoingRequests, Status, Response} from '../models/friends';

// Import the DB wrapper
import {SequelizeWrapper} from '../utils/sequelizeWrapper';

const username = 'alice'; // TEMPORARY

export function get(request: h.Request, reply: h.IReply) {
	let instance = SequelizeWrapper.getInstance(username);
	instance.model('friend').findAll({
		include: [{
			model: instance.model('profile'),
			attributes: ['description']
		}]
	}).then((users: s.Instance<any>[]) => {
		let response = new Response();

		for(let i in users) {
			let user = users[i];
			let status: string = user.get('status');
			let username: string = user.get('username') + '@' + user.get('url');
			// Ugly index so TypeScript doesn't yell at us
			let description: string = user['profile'].get('description');
			// If a friend request isn't of one of these 5 values, it will
			// be ignored
			switch(Status[status]) {
				case Status.accepted:
					response.addAccepted(new Friend(username, description));
					break;
				case Status.following:
					response.addFollowing(new Friend(username, description));
					break;
				case Status.incoming:
					response.addIncoming(new Friend(username, description));
					break;
				case Status.pending:
				case Status.declined:
					response.addSent(new OutgoingRequests(username, status));
					break;
			}
		}

		reply(response);
	}).catch((e) => {
		reply(e);
	});
}

export let friendSchema = j.object({
	user: j.string().required().description('User (formatted as `username@instance-domain.tld`)'),
	description: j.string().description('User description')
}).label('Friend');

export let friendSentSchema = j.object({
	user: j.string().required().description('User (formatted as `username@instance-domain.tld`)'),
	status: j.string().required().valid('pending', 'declined').description('Request status (pending or refused)')
}).label('FriendSent');

export let friendsSchema = j.object({
	accepted: j.array().required().items(friendSchema).label('FriendsAccepted').description('Accepted friend requests'),
	incoming: j.array().required().items(friendSchema).label('FriendsReceived').description('Incoming friend requests'),
	sent: j.array().required().items(friendSentSchema).label('FriendsSent').description('Sent (pending) friend requests'),
	following: j.array().required().items(friendSchema).label('FriendsFollowings').description('People followed by the user'),
}).label('Friends');