"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
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
exports.commentSchema = j.object({
    postAuthor: j.string().email().description('The author of the post that the comment is referencing'),
    postTs: j.number().description('The timestamp of the post that the comment is referencing'),
    creationTs: j.number().description('The comment\'s creation timestamp'),
    lastEditTs: j.number().description('The comment\'s last modification timestamp'),
    author: j.string().email().description('The author of the comment'),
    coment: j.string().description('The comment\'s content')
});
