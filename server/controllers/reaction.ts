import * as Hapi from 'hapi';

import {Post} from '../models/posts';
import {SequelizeWrapper} from '../utils/sequelizeWrapper';

import {username} from '../utils/username';
import * as utils from '../utils/serverUtils'

export function count(postTimestamp: number): Promise<number> {
	return new Promise<number>((ok, ko) => {
		SequelizeWrapper.getInstance(username).model('reaction').count({ where: {
			creationTs: postTimestamp
		}}).then((count) => {
			ok(count);
		}).catch(ko);
	})
}

export function reacted(postTimestamp: number): Promise<boolean> {
	return new Promise<boolean>(async (ok, ko) => {
		let user = await utils.getUser(username);
		SequelizeWrapper.getInstance(username).model('reaction').count({ where: {
			creationTs: postTimestamp,
			username: user.username,
			url: user.instance
		}}).then((count) => {
			ok(!!count);
		}).catch(ko);
	})
}