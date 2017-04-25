import * as Hapi from 'hapi';

const posts = require('./controllers/loader');

const pkg = require('../../package.json')

const printit = require('printit');
const log = printit({
	date: true,
	prefix: 'hapi'
});

const server = new Hapi.Server({ debug: { request: ['error'] } } as Hapi.IServerOptions);
const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

server.connection({ port: port, host: host });

// Register the middlewares
server.register([
	require('inert'),
	{
		register: require('hapi-swagger'),
		options: { 
			info: {
				'title': pkg.name,
				'description': pkg.description,
				'version': pkg.version,
			},
			grouping: 'tags',
			'tags': [{
				name: 'posts',
				description: 'User-inputed posts'
			},{
				name: 'user',
				description: 'Current user'
			}]
		}
	},
	require('vision')
], (err) => {
	if(err) {
		log.error(err);
		process.exit(1);
	}

	// Serve the client
	server.route({
		method: 'GET',
		path: '/{file*}',
		handler: {
			directory: {
				path: __dirname + '/../client/',
				listing: true
			}
		}
	});
	
	posts(server);
});

// Start the server
server.start((err) => {
	if(err) {
		log.error(err);
		process.exit(1);
	}
	
	log.info('Server running at', server.info.uri);
});