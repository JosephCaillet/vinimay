import * as h from 'hapi';
import * as s from 'sequelize';
import * as j from 'joi';

import {SequelizeWrapper} from '../utils/sequelizeWrapper';

export function get(request: h.Request, reply: h.IReply) {
	reply('Get posts');
}

export function create(request: h.Request, reply: h.IReply) {
	reply('Create post');
}

export let postSchema = j.object({
	"creationTs": j.number().min(1).required().description('Post creation timestamp'),
	"lastEditTs": j.number().min(1).required().description('Last modification timestamp (equals to the creation timestamp if the post has never been edited)'),
	"author": j.string().email().required().description('Post author (using the `username@instanceurl.tld` format)'),
	"content": j.string().required().description('Post content'),
	"privacy": j.string().valid('public', 'private', 'friends').required().description('Post privacy setting ()'),
	"comments": j.number().min(0).required(),
	"reactions": j.number().min(0).required()
}).label('Post');

export let responseSchema = j.object({
	"authenticated": j.bool().required(),
	"posts": j.array().items(postSchema).required().label('Posts array')
}).label('Posts response');