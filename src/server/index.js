'use strict';

//
// Dependencies
// -------------------------------------
var Hapi       = require('hapi');
var Lout       = require('lout');
var handlebars = require('handlebars');
var routes     = require('./config/routes');
var settings   = require('./config/settings');
var log        = require('./util/log');
var path       = require('path');

// Spin up the server
var server = new Hapi.Server();

// Apply connection settings to the server
server.connection({
	port: settings.get('port')
});

// Setup handlebars are the view engine. Later in route handlers you can simply
// do `reply.view('someview')` in order to render them
server.views({
	engines: {
		html: handlebars
	},
	path: path.join(__dirname, 'views'),
	layoutPath: path.join(__dirname, 'views', 'layouts'),
	layout: 'default'
});

//
// Register packs
// -------------------------------------
// Packs are basically plugins for Hapi

var packs = [
	Lout,
	{
		register: require('good'), // logging
		options: {
			reporters: [ // ability to send logs to multiple recipients
				{
					reporter: require('good-bunyan'),
					events: { log: '*', response: '*', error: '*', request: '*' },
					config: {
						logger: log, // hand it our instance of bunyan
						levels: { response: 'info' } // map log types to log levels
					}
				}
			]
		}
	}
];

server.register(packs, function(err) {
	if (err) {
		log.fatal(err);
	}

	//
	// Register routes
	// -------------------------------------
	server.route(routes);

	//
	// Start server
	// -------------------------------------
	server.start(function() {
		log.info('Server started at ' + server.info.uri);
	});
});


// Export the server for testing
module.exports = server;

