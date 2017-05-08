import * as h from 'hapi';
import * as j from 'joi';
import * as b from 'boom';

export let user = j.string().regex(/.+@.+/);

export let settings = require('../../../settings.json');

export function checkAndSendSchema(object: any, schema: j.AnySchema<any>, log: any, reply: h.IReply) {
	let err;
	if(err = j.validate(object, schema).error) {
		log.error(err);
		reply(b.badImplementation())
	} else {
		reply(object);
	}
}