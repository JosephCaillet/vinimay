"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
const b = require("boom");
exports.user = j.string().regex(/.+@.+/);
exports.settings = require('../../../settings.json');
function checkAndSendSchema(object, schema, log, reply) {
    let err;
    if (err = j.validate(object, schema).error) {
        log.error(err);
        reply(b.badImplementation());
    }
    else {
        reply(object);
    }
}
exports.checkAndSendSchema = checkAndSendSchema;
