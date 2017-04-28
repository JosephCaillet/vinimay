"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username_1 = require("../utils/username");
function count(postTimestamp) {
    return new Promise((ok, ko) => {
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username_1.username).model('comment').count({ where: {
                creationTs_Post: postTimestamp
            } }).then((count) => {
            ok(count);
        }).catch(e => ko(e));
    });
}
exports.count = count;
