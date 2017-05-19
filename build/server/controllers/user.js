"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const b = require("boom");
const j = require("joi");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username_1 = require("../utils/username");
const users_1 = require("../models/users");
const serverUtils_1 = require("../utils/serverUtils");
const commons_1 = require("../utils/commons");
const friendUtils_1 = require("../utils/friendUtils");
const log = require('printit')({
    date: true,
    prefix: 'user'
});
function get(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    instance.model('user').findOne({
        include: [{
                model: instance.model('profile'),
                attributes: ['description']
            }]
    }).then((user) => {
        if (!user) {
            log.warn('Could not retrieve current user. This means the user creation failed or the database has been tempered with.');
            return reply(b.notFound());
        }
        let res = {
            username: user.get('username'),
            url: user.get('url'),
            description: user['profile'].get('description')
        };
        return commons_1.checkAndSendSchema(res, exports.schema, log, reply);
    }).catch((e) => {
        reply(b.wrap(e));
    });
}
exports.get = get;
;
function getRemote(request, reply) {
    let user = new users_1.User(request.params.user);
    friendUtils_1.getRemoteUserData(user)
        .then((data) => {
        return commons_1.checkAndSendSchema(data, exports.schema, log, reply);
    }).catch(e => serverUtils_1.handleRequestError(user, e, log, false, reply));
}
exports.getRemote = getRemote;
function update(request, reply) {
    reply('hello');
}
exports.update = update;
;
exports.schema = j.object({
    username: j.string().required().description('User\'s username'),
    url: j.string().required().description('Domain of the instance the user is on'),
    description: j.string().description('Description (aka bio in some social medias) of the user')
}).label('User');
