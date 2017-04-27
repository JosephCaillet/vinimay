"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const j = require("joi");
function get(request, reply) {
    reply('Get posts');
}
exports.get = get;
function create(request, reply) {
    reply('Create post');
}
exports.create = create;
exports.postSchema = j.object({
    "creationTs": j.number().min(1).required().description('Post creation timestamp'),
    "lastEditTs": j.number().min(1).required().description('Last modification timestamp (equals to the creation timestamp if the post has never been edited)'),
    "author": j.string().email().required().description('Post author (using the `username@instance-domain.tld` format)'),
    "content": j.string().required().description('Post content'),
    "privacy": j.string().valid('public', 'private', 'friends').required().description('Post privacy setting (private, friends or public)'),
    "comments": j.number().min(0).required().description('Number of comments on the post'),
    "reactions": j.number().min(0).required().description('Numer of reactions on the post')
}).label('Post');
exports.responseSchema = j.object({
    "authenticated": j.bool().required().description('Boolean indicating whether the user is authenticated'),
    "posts": j.array().items(exports.postSchema).required().label('Posts array')
}).label('Posts response');
