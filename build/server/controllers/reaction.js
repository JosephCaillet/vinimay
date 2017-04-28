"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
function count(postTimestamp, username) {
    return new Promise((ok, ko) => {
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username).model('reaction').count({ where: {
                creationTs: postTimestamp
            } }).then((count) => {
            ok(count);
        }).catch(e => ko(e));
    });
}
exports.count = count;
