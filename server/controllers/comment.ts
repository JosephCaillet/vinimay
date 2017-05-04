import * as h from 'hapi';
import * as j from 'joi';

import {Post} from '../models/posts';
import {SequelizeWrapper} from '../utils/sequelizeWrapper';

import {username} from '../utils/username';


export function get(request: h.Request, reply: h.IReply) {
	
}


export function add(request: h.Request, reply: h.IReply) {
	
}


export function update(request: h.Request, reply: h.IReply) {
	
}


export function del(request: h.Request, reply: h.IReply) {
	
	
}


export function serverGet(request: h.Request, reply: h.IReply) {
	
}


export function serverAdd(request: h.Request, reply: h.IReply) {
	
}


export let commentSchema = j.object({
	postAuthor: j.string().required().email().description('The author of the post that the comment is referencing'),
	postTs: j.number().required().description('The timestamp of the post that the comment is referencing'),
	creationTs: j.number().required().description('The comment\'s creation timestamp'),
	lastEditTs: j.number().required().description('The comment\'s last modification timestamp'),
	author: j.string().required().email().description('The author of the comment'),
	content: j.string().required().description('The comment\'s content')
}).label('Comment');

export let commentsSchema = j.object({
	authenticated: j.boolean().required().description('Boolean indicating whether the user is authenticated'),
	comments: j.array().items(commentSchema).required().description('Array of comments').label('Comments array')
}).label('Comments response')

export function count(postTimestamp: number): Promise<number> {
	return new Promise<number>((ok, ko) => {
		SequelizeWrapper.getInstance(username).model('comment').count({ where: {
			creationTs_Post: postTimestamp
		}}).then((count) => {
			ok(count);
		}).catch(e => ko(e));
	})
}