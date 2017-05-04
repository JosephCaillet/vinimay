"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const b = require("boom");
const j = require("joi");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username_1 = require("../utils/username");
function get(request, reply) {
    let instance = sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username);
    instance.model('user').findOne({
        include: [{
                model: instance.model('profile'),
                attributes: ['description']
            }]
    }).then((user) => {
        reply({
            username: user.get('username'),
            url: user.get('url'),
            description: user['profile'].get('description')
        });
    }).catch((e) => {
        reply(b.wrap(e));
    });
}
exports.get = get;
;
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
