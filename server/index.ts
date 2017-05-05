import * as Hapi from 'hapi';
import * as loader from './controllers/loader';

const pkg = require('../../package.json')

const printit = require('printit');
const log = printit({
	date: true,
	prefix: 'hapi'
});

let debug: any = {};

if(process.env.DEBUG) {
	debug = {
		log: ['error'],
		request: ['error']
	}; 
}

const server = new Hapi.Server({ 
	debug: debug,
	connections: <Hapi.IConnectionConfigurationServerDefaults>{
		routes: { cors: {
			origin: ['*'],
			credentials: true
		}}
	}
} as Hapi.IServerOptions);
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

	// Load the routes from the main router
	loader.loadRoutes(server);
});

// Start the server
server.start((err) => {
	if(err) {
		log.error(err);
		process.exit(1);
	}
	
	log.info('Server running at', server.info.uri);
});