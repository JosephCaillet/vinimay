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
	"creationTs": j.number().min(1).required(),
	"lastEditTs": j.number().min(1).required(),
	"author": j.string().email().required(),
	"content": j.string().required(),
	"privacy": j.string().valid('public', 'private', 'friends').required(),
	"comments": j.number().min(0).required(),
	"reactions": j.number().min(0).required()
}).label('Post');

export let responseSchema = j.object({
	"authenticated": j.bool().required(),
	"posts": j.array().items(postSchema).required().label('Posts array')
}).label('Posts response');