"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const posts = require("./post");
const user = require("./user");
const friend = require("./friend");
module.exports = {
    v1: {
        '/client/me': {
            get: {
                description: 'Retrieve data on the current user',
                notes: 'Retrieve data on the current user. Full documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieval).',
                handler: user.get,
                plugins: {
                    'hapi-swagger': {
                        responses: {
                            '200': {
                                description: 'Data on the current user',
                                schema: user.schema
                            }, '401': {
                                description: 'The user is not authenticated as a server user.'
                            }
                        }
                    }
                }
            },
            post: {
                description: 'Update data on the current user',
                notes: 'Update data on the current user. Full documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#update).',
                handler: user.update,
                validate: { payload: Joi.object({
                        description: Joi.string().required().description('New user description')
                    }).label('UserDataInput')
                },
                plugins: {
                    'hapi-swagger': {
                        responses: {
                            '200': {
                                description: 'Data on the current user',
                                schema: user.schema
                            }, '401': {
                                description: 'The user is not authenticated as a server user.'
                            }
                        }
                    }
                }
            }
        },
        '/client/posts': {
            get: {
                description: 'Retrieve posts',
                notes: 'Retrieve all posts or using filters. Use either with both `start` and `nb` parameters, or both `from` and `to` parameters. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieval-1).',
                handler: posts.get,
                validate: { query: {
                        start: Joi.number().optional().min(1).description('Offset to start the retrieval. For example, `start=20` will retrieve all posts from the 20th most recent one, in anti-chronological order.'),
                        nb: Joi.number().optional().min(1).description('Number of posts to retrieve'),
                        from: Joi.number().optional().min(1).description('Most recent timestamp for a time frame retrieval'),
                        to: Joi.number().optional().min(1).description('Oldest for a time frame retrieval'),
                    } },
                plugins: {
                    'hapi-swagger': {
                        responses: {
                            '200': {
                                description: 'A list of posts with an information on authentication',
                                schema: posts.responseSchema
                            }
                        }
                    }
                }
            },
            post: {
                description: 'Create a post',
                notes: 'Creates a post, provided the necessary information is present. Full documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#creation).',
                handler: posts.create,
                validate: { payload: Joi.object({
                        content: Joi.string().required().description('Post content'),
                        privacy: Joi.string().valid('public', 'private', 'friends').required().description('Post privacy setting (private, friends or public)')
                    }).label('PostInput')
                },
                plugins: {
                    'hapi-swagger': {
                        responses: {
                            '200': {
                                description: 'The created post',
                                schema: posts.postSchema
                            }, '401': {
                                description: 'The user is not authenticated as a server user.'
                            }
                        }
                    }
                }
            }
        },
        '/client/posts/{user}/{timestamp}': {
            get: {
                description: 'Retrieve a single post',
                notes: 'Retrieve a single post using its creation timestamp. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieve-one-post).',
                handler: posts.getSingle,
                validate: { params: {
                        user: Joi.string().email().required().description('The post\'s author, identified as `username@instance-domain.tld`'),
                        timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
                    } },
                plugins: { 'hapi-swagger': { responses: {
                            '200': {
                                description: 'A list of posts with an information on authentication',
                                schema: posts.postSchema
                            }
                        } } }
            },
            delete: {
                description: 'Delete a single post',
                notes: 'Delete a single post using its creation timestamp. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#deletion).',
                handler: posts.del,
                validate: { params: {
                        user: Joi.string().email().required().description('The post\'s author, identified as `username@instance-domain.tld`'),
                        timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
                    } },
                plugins: { 'hapi-swagger': { responses: {
                            '204': {
                                description: 'The deletion occured without any issue'
                            },
                            '401': {
                                description: 'The user trying to perform the deletion isn\'t the post\' author'
                            }
                        } } }
            }
        },
        '/client/friends': {
            get: {
                description: 'Retrieve all friend requests',
                notes: 'Retrieve all friend requests (accepted, incoming and sent). Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieval-4).',
                handler: friend.get,
                plugins: {
                    'hapi-swagger': {
                        responses: {
                            '200': {
                                description: 'A list of friend requests',
                                schema: friend.friendsSchema
                            }
                        }
                    }
                }
            }
        },
        '/dummy': {
            get: {
                description: 'Ping',
                handler: function (request, reply) {
                    reply('pong');
                },
                plugins: { 'hapi-swagger': { responses: { '200': {
                                description: 'Pong',
                            } } } }
            },
            post: {
                description: '401 error',
                handler: function (request, reply) {
                    reply('pong').code(401);
                },
                plugins: { 'hapi-swagger': { responses: { '401': {
                                description: 'Pong',
                            } } } }
            },
            put: {
                description: '500 error',
                handler: function (request, reply) {
                    reply('pong').code(500);
                },
                plugins: { 'hapi-swagger': { responses: { '500': {
                                description: 'Pong',
                            } } } }
            }
        }
    }
};
