import * as Hapi from 'hapi';
import * as url from 'url';

const routes = require('./routes');

module.exports = (server: Hapi.Server) => {
	for(let tag in routes) {
		let paths = routes[tag];

		for(let path in paths) {
			let methods = paths[path];

			for(let method in methods) {
				let handler = methods[method];

				let route = {
					method: method,
					path: '/' + tag + path,
					handler: methods[method].handler,
					config: methods[method]
				};
				
				route.config.tags = ['api', tag];
				
				delete route.config.handler;

				server.route(route);
			}
		}
	}
}