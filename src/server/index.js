'use strict';

//
// Dependencies
// -------------------------------------
var Hapi        = require('hapi');
var Inert       = require('inert');
var Vision      = require('vision');
var HapiSwagger = require('hapi-swagger');
var Good        = require('good');
var GoodBunyan  = require('good-bunyan');
var handlebars  = require('handlebars');
var routes      = require('./config/routes');
var settings    = require('./config/settings');
var log         = require('./util/log');
var path        = require('path');

// Spin up the server
var server = new Hapi.Server();

// Apply connection settings to the server
server.connection({
	host: '0.0.0.0',
	port: settings.port
});

//
// Register packs
// -------------------------------------
// Packs are basically plugins for Hapi

var packs = [
	Inert, // static file serving
	Vision, // server side templating
	HapiSwagger, // api documentation
	{
		register: Good, // logging
		options: {
			reporters: [ // ability to send logs to multiple recipients
				{
					reporter: GoodBunyan,
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

	// Setup handlebars are the view engine. Later in route handlers you can simply
	// do `reply.view('someview')` in order to render them
	server.views({
		engines: {
			html: handlebars
		},
		path: path.join(__dirname, 'views'),
		layoutPath: path.join(__dirname, 'views', 'layouts'),
		layout: 'default',
		isCached: settings.cacheTemplates
	});

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

