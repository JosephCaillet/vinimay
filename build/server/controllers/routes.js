"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const posts = require("./post");
const comments = require("./comment");
const user = require("./user");
const friend = require("./friend");
const commons = require("../utils/commons");
const postUrlSchema = Joi.object({
    user: commons.user.required().description('The post\'s author, identified as `username@instance-domain.tld`'),
    timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
}).label('PostParams');
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
                notes: 'Retrieve all posts or using filters. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieval-1).',
                handler: posts.get,
                validate: { query: {
                        from: Joi.number().optional().min(1).description('Most recent timestamp'),
                        nb: Joi.number().optional().min(1).description('Number of posts to retrieve')
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
        '/client/posts/{timestamp}': {
            delete: {
                description: 'Delete a single post',
                notes: 'Delete a single post using its creation timestamp. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#deletion).',
                handler: posts.del,
                validate: { params: {
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
        '/client/posts/{user}/{timestamp}': {
            get: {
                description: 'Retrieve a single post',
                notes: 'Retrieve a single post using its creation timestamp. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieve-one-post).',
                handler: posts.getSingle,
                validate: { params: postUrlSchema },
                plugins: { 'hapi-swagger': { responses: {
                            '200': {
                                description: 'A list of posts with an information on authentication',
                                schema: posts.postSchema
                            }, '404': {
                                description: 'The requested post cannot be found'
                            }, '503': {
                                description: 'The remote instance could not be reached, or an API implementation issue prevented the connexion'
                            }
                        } } }
            },
        },
        '/client/posts/{user}/{timestamp}/comments': {
            get: {
                description: 'Retrieve comments for a post',
                notes: 'Retrieve comments for a given post based on its user and timestamp. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieval-2).',
                handler: comments.get,
                validate: {
                    params: postUrlSchema,
                    query: {
                        from: Joi.number().min(1).description('Most recent timestamp'),
                        nb: Joi.number().min(1).description('Number of comments to retrieve')
                    }
                },
                plugins: { 'hapi-swagger': { responses: {
                            '200': {
                                description: 'Comments associated to the given post',
                                schema: comments.commentsSchema
                            }, '404': {
                                description: 'The referred post cannot be found'
                            }, '503': {
                                description: 'The instance hosting the post could not be reached, or an API implementation issue prevented the connexion'
                            }
                        } } }
            },
            post: {
                description: 'Create a new comment to a post',
                notes: 'Create a comment on a givent post. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#creation-1).',
                handler: comments.add,
                validate: {
                    params: postUrlSchema,
                    payload: comments.commentsInput
                },
                plugins: { 'hapi-swagger': { responses: {
                            '200': {
                                description: 'The created comment',
                                schema: comments.commentSchema,
                            }, '401': {
                                description: 'The user is not authorized to create a comment on this post'
                            }
                        } } }
            }
        },
        '/client/friends': {
            get: {
                description: 'Retrieve all friend requests',
                notes: 'Retrieve all friend requests (accepted, incoming and sent). Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieval-4).',
                handler: friend.get,
                plugins: { 'hapi-swagger': { responses: {
                            '200': {
                                description: 'A list of friend requests',
                                schema: friend.friendsSchema
                            }
                        } }
                }
            }
        },
        '/server/posts': {
            get: {
                description: 'Retrieve posts',
                notes: 'Retrieve all posts or using filters. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Server-to-server-API#retrieve-several-posts).',
                handler: posts.serverGet,
                validate: { query: {
                        from: Joi.number().min(1).description('Most recent timestamp'),
                        nb: Joi.number().min(1).description('Number of posts to retrieve'),
                        idToken: Joi.string().description('Identification token bound to a friend. If not provided, only public posts will be sent'),
                        signature: Joi.string().when('idToken', { is: Joi.string().required(), then: Joi.required(), otherwise: Joi.optional() }).description('Request signature. Must be provided if an idToken is provided')
                    } },
                plugins: {
                    'hapi-swagger': {
                        responses: {
                            '200': {
                                description: 'A list of posts with an information on authentication',
                                schema: posts.postsArray
                            }, '401': { description: 'The idToken is unknown' }
                        }
                    }
                }
            }
        },
        '/server/posts/{timestamp}': {
            get: {
                description: 'Retrieve a single post',
                notes: 'Retrieve a single post using its creation timestamp. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Server-to-server-API#retrieve-one-post).',
                handler: posts.serverGetSingle,
                validate: {
                    params: {
                        timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
                    },
                    query: {
                        idToken: Joi.string().description('Identification token bound to a friend. If not provided, only public posts will be sent'),
                        signature: Joi.string().when('idToken', { is: Joi.string().required(), then: Joi.required(), otherwise: Joi.optional() }).description('Request signature. Must be provided if an idToken is provided')
                    }
                },
                plugins: { 'hapi-swagger': { responses: {
                            '200': {
                                description: 'A list of posts with an information on authentication',
                                schema: posts.postSchema
                            }
                        } } }
            }
        },
        '/server/posts/{timestamp}/comments': {
            get: {
                description: 'Retrieve comments from a post',
                notes: 'Retrieve comments from a post using its creation timestamp. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Server-to-server-API#retrieving-comments-on-a-post).',
                handler: comments.serverGet,
                validate: {
                    params: {
                        timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
                    },
                    query: {
                        from: Joi.number().min(1).description('Most recent timestamp'),
                        nb: Joi.number().min(1).description('Number of comments to retrieve'),
                        idToken: Joi.string().description('Identification token bound to a friend'),
                        signature: Joi.string().when('idToken', { is: Joi.string().required(), then: Joi.required(), otherwise: Joi.optional() }).description('Request signature. Must be provided if an idToken is provided')
                    }
                },
                plugins: { 'hapi-swagger': { responses: {
                            '200': {
                                description: 'A list of comments with an information on authentication',
                                schema: comments.commentsArray
                            }
                        } } }
            },
            post: {
                description: 'Add a comment to a post',
                notes: 'Add a comment to a post using the post\'s creation timestamp. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Server-to-server-API#post-a-comment).',
                handler: comments.serverAdd,
                validate: {
                    payload: comments.commentsInput,
                    params: {
                        timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
                    },
                    query: {
                        idToken: Joi.string().description('Identification token bound to a friend'),
                        signature: Joi.string().when('idToken', { is: Joi.string().required(), then: Joi.required(), otherwise: Joi.optional() }).description('Request signature. Must be provided if an idToken is provided')
                    }
                },
                plugins: { 'hapi-swagger': { responses: {
                            '200': {
                                description: 'The created comment',
                                schema: comments.commentSchema
                            }
                        } } }
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
