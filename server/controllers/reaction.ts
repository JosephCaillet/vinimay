import * as h from 'hapi';

import {Post} from '../models/posts';
import {SequelizeWrapper} from '../utils/sequelizeWrapper';

import {username} from '../utils/username';

export function count(postTimestamp: number): Promise<number> {
	return new Promise<number>((ok, ko) => {
		SequelizeWrapper.getInstance(username).model('reaction').count({ where: {
			creationTs: postTimestamp
		}}).then((count) => {
			ok(count);
		}).catch(e => ko(e));
	})
}