"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
const username_1 = require("../utils/username");
function get(request, reply) {
}
exports.get = get;
function add(request, reply) {
}
exports.add = add;
function update(request, reply) {
}
exports.update = update;
function del(request, reply) {
}
exports.del = del;
function serverGet(request, reply) {
}
exports.serverGet = serverGet;
function serverAdd(request, reply) {
}
exports.serverAdd = serverAdd;
exports.commentSchema = j.object({
    postAuthor: j.string().required().email().description('The author of the post that the comment is referencing'),
    postTs: j.number().required().description('The timestamp of the post that the comment is referencing'),
    creationTs: j.number().required().description('The comment\'s creation timestamp'),
    lastEditTs: j.number().required().description('The comment\'s last modification timestamp'),
    author: j.string().required().email().description('The author of the comment'),
    content: j.string().required().description('The comment\'s content')
}).label('Comment');
exports.commentsSchema = j.object({
    authenticated: j.boolean().required().description('Boolean indicating whether the user is authenticated'),
    comments: j.array().items(exports.commentSchema).required().description('Array of comments').label('Comments array')
}).label('Comments response');
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
