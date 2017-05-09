"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username_1 = require("../utils/username");
const utils = require("../utils/serverUtils");
function count(postTimestamp) {
    return new Promise((ok, ko) => {
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username).model('reaction').count({ where: {
                creationTs: postTimestamp
            } }).then((count) => {
            ok(count);
        }).catch(ko);
    });
}
exports.count = count;
function reacted(postTimestamp) {
    return new Promise(async (ok, ko) => {
        let user = await utils.getUser(username_1.username);
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username).model('reaction').count({ where: {
                creationTs: postTimestamp,
                username: user.username,
                url: user.instance
            } }).then((count) => {
            ok(!!count);
        }).catch(ko);
    });
}
exports.reacted = reacted;
