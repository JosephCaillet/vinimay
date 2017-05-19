import * as Hapi from 'hapi';
import * as Joi from 'joi';

import * as posts from './post';
import * as comments from './comment';
import * as reactions from './reaction';
import * as user from './user';
import * as friends from './friend';

import * as commons from '../utils/commons';

const postUrlSchema = Joi.object({
	user: commons.user.required().description('The post\'s author, identified as `username@instance-domain.tld`'),
	timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
}).label('PostParams');

const tokens = Joi.object({
	idToken: Joi.string().description('Identification token bound to a friend'),
	signature: Joi.string().when('idToken', { is: Joi.string().required(), then: Joi.required(), otherwise: Joi.optional() }).description('Request signature. Must be provided if an idToken is provided')
}).label('Tokens')

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
			put: {
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
		'/client/user/{user}': {
			get: {
				description: 'Retrieve data on a given user user',
				notes: 'Retrieve data on a given user user.',
				handler: user.getRemote,
				validate: { params: {
					user: commons.user.required().description('The user to retrieve data from')
				}},
				plugins: {
					'hapi-swagger': {
						responses: {
							'200': {
								description: 'Data on the current user',
								schema: user.schema
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
					nb: Joi.number().optional().min(1).description('Number of posts to retrieve'),
					author: commons.user.optional().description('The author to target')
				}},
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
				}},
				plugins: { 'hapi-swagger': { responses: {
					'204': {
						description: 'The deletion occured without any issue'
					},
					'401': {
						description: 'The user trying to perform the deletion isn\'t the post\' author'
					}
				}}}
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
				}}}
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
				}}}
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
				}}}
			}
		},
		'/client/posts/{user}/{timestamp}/comments/{commentTimestamp}': {
			delete: {
				description: 'Remove a comment',
				notes: 'Remove a comment given its author and timestamp',
				handler: comments.del,
				validate: {
					params: {
						user: commons.user.required().description('Post author'),
						timestamp: Joi.number().required().description('Post timestamp'),
						commentTimestamp: Joi.number().required().description('Comment timestamp'),
					}
				},
				plugins: { 'hapi-swagger': { responses: {
					'204': { description: 'The comment has been deleted' },
					'404': { description: 'The comment was not found' }
				}}}
			}
		},
		'/client/posts/{user}/{timestamp}/reactions': {
			post: {
				description: 'Add a reaction',
				notes: 'Add a reaction to a given post',
				handler: reactions.add,
				validate: {
					params: {
						user: commons.user.required().description('Post author'),
						timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
					}
				},
				plugins: { 'hapi-swagger': { responses: {
					'204': { description: 'The reaction was successfully created' }
				}}}
			},
			delete: {
				description: 'Delete a reaction',
				notes: 'Delete a reaction to a given post',
				handler: reactions.del,
				validate: {
					params: {
						user: commons.user.required().description('Post author'),
						timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
					}
				},
				plugins: { 'hapi-swagger': { responses: {
					'204': {
						description: 'The reaction was successfully deleted'
					}
				}}}
			}
		},
		'/client/friends': {
			get: {
				description: 'Retrieve all friend requests',
				notes: 'Retrieve all friend requests (accepted, incoming and sent). Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieval-4).',
				handler: friends.get,
				plugins: { 'hapi-swagger': { responses: {
					'200': {
						description: 'A list of friend requests',
						schema: friends.friendsSchema
					}}}
				}
			},
			post: {
				description: 'Create a friend/following request',
				notes: 'Create a friend request or follow a given user',
				handler: friends.create,
				validate: {
					payload: Joi.object({
						to: commons.user.required().description('Request recipient'),
						type: Joi.string().valid('friend', 'following').required().description('Type of request')
					}).label('Friend input')
				},
				plugins: { 'hapi-swagger': { responses: {
					'200': {
						description: 'The request creation has been accepted by the server and will be processed',
						schema: friends.friendSchema
					},
					'403': { description: 'The user is trying to follow/befriend itself' },
					'409': { description: 'A request already exists for this user' }
				}}}
			}
		},
		'/server/friends': {
			post: {
				description: 'Save friend request',
				notes: 'Receive friend request and save it in the database as incoming',
				handler: friends.saveFriendRequest,
				validate: { payload: Joi.object({
					from: commons.user.required().description('User the request is coming from'),
					tempToken: Joi.string().alphanum().required().description('Temporary token identifying the request')
				}).label('Friend request')},
				plugins: {
					'hapi-swagger': {
						responses: {
							'200': {
								description: 'The request creation has been accepted by the server and will be processed',
								schema: friends.friendSchema
							},
							'403': { description: 'The user is trying to follow/befriend itself' },
							'409': { description: 'A request already exists for this user' }
						}
					}
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
				}},
				plugins: {
					'hapi-swagger': {
						responses: {
							'200': {
								description: 'A list of posts with an information on authentication',
								schema: posts.postsArray
							}, '401': {	description: 'The idToken is unknown' }
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
					query: tokens
				},
				plugins: { 'hapi-swagger': { responses: {
					'200': {
						description: 'A list of posts with an information on authentication',
						schema: posts.postSchema
					}
				}}}
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
				}}}
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
					query: tokens
				},
				plugins: { 'hapi-swagger': { responses: {
					'200': {
						description: 'The created comment',
						schema: comments.commentSchema
					}
				}}}
			}
		},
		'/server/posts/{timestamp}/comments/{commentTimestamp}': {
			delete: {
				description: 'Remove a comment',
				notes: 'Remove a comment given its author and timestamp',
				handler: comments.serverDel,
				validate: {
					params: {
						timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp'),
						commentTimestamp: Joi.number().integer().min(1).required().description('The comment\'s creation timestamp')
					},
					query: tokens
				},
				plugins: { 'hapi-swagger': { responses: {
					'204': { description: 'The comment has been deleted' },
					'400': { description: 'The comment author was required but not provided' },
					'401': { description: 'Incorrect signature' },
					'404': { description: 'The comment or its author was not found' }
				}}}
			}
		},
		'/server/posts/{timestamp}/reactions': {
			post: {
				description: 'Add a reaction',
				notes: 'Add a reaction to a given post',
				handler: reactions.serverAdd,
				validate: {
					payload: Joi.object({
						author: commons.user.required().description('Reaction author'),
					}).label('Reaction'),
					params: {
						timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
					},
					query: tokens
				},
				plugins: { 'hapi-swagger': { responses: {
					'200': {
						description: 'The created reaction',
						schema: reactions.reactionsSchema
					}
				}}}
			},
			delete: {
				description: 'Delete a reaction',
				notes: 'Delete a reaction to a given post',
				handler: reactions.serverDel,
				validate: {
					payload: Joi.object({
						author: commons.user.required().description('Reaction author'),
					}).label('Reaction'),
					params: {
						timestamp: Joi.number().integer().min(1).required().description('The post\'s creation timestamp')
					},
					query: tokens
				},
				plugins: { 'hapi-swagger': { responses: {
					'204': {
						description: 'The reaction has been successfully deleted'
					}
				}}}
			}
		}
	}
}