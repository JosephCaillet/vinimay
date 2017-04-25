import * as Hapi from 'hapi';
import * as Joi from 'joi';

import * as posts from './posts';
const user	= require('./user');

module.exports = {
	v1: {
		'/client/posts': {
			get: {
				description: 'Retrieve posts',
				notes: 'Retrieve all posts or using filters. Use either with both `start` and `nb` parameters, or both `from` and `to` parameters. Further documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieval-1).',
				category: 'posts',
				handler: posts.get,
				validate: { query: {
					start: Joi.number().optional().min(1).description('Offset to start the retrieval. For example, `start=20` will retrieve all posts from the 20th most recent one, in anti-chronological order.'),
					nb: Joi.number().optional().min(1).description('Number of posts to retrieve'),
					from: Joi.number().optional().min(1).description('Smallest timestamp for a time frame retrieval'),
					to: Joi.number().optional().min(1).description('Biggest timestamp for a time frame retrieval'),
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
				category: 'posts',
				handler: posts.create,
				validate: { params: {
					content: Joi.string().required(),
					privacy: Joi.string().valid('public', 'private', 'friends').required()
				}},
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
		'/client/me': {
			get: {
				description: 'Retrieve data on the current user',
				notes: 'Retrieve data on the current user. Full documentation is available [here](https://github.com/JosephCaillet/vinimay/wiki/Client-to-server-API#retrieval).',
				category: 'user',
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
			}
		}
	}
}