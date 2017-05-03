import * as h from 'hapi';
import * as j from 'joi';

import {Post} from '../models/posts';
import {SequelizeWrapper} from '../utils/sequelizeWrapper';

import {username} from '../utils/username';

export function count(postTimestamp: number): Promise<number> {
	return new Promise<number>((ok, ko) => {
		SequelizeWrapper.getInstance(username).model('comment').count({ where: {
			creationTs_Post: postTimestamp
		}}).then((count) => {
			ok(count);
		}).catch(e => ko(e));
	})
}

export let commentSchema = j.object({
	postAuthor: j.string().email().description('The author of the post that the comment is referencing'),
	postTs: j.number().description('The timestamp of the post that the comment is referencing'),
	creationTs: j.number().description('The comment\'s creation timestamp'),
	lastEditTs: j.number().description('The comment\'s last modification timestamp'),
	author: j.string().email().description('The author of the comment'),
	coment: j.string().description('The comment\'s content')
})