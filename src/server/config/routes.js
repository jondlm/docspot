//
// Routes
// -----------------------------------------------------------------------------
//
// This should contain all the routes for your application. Keeping them in one
// location helps on-board new developers and keeps things tidy. If your app
// grows to be huge, it sometimes makes sense to break the routes into their
// own files, but I wouldn't recommend it unless you have 100+ routes or so.

var _        = require('lodash');
var Joi      = require('joi');
var log      = require('../util/log');
var settings = require('./settings');
var CLEAN_STRING_REGEX    = /^[a-zA-Z0-9\._-]{1,255}$/;

//
// Controllers
// -------------------------------------
//
// Here we require in any controllers which export handlers that we can hook up
// to our routes.

var applicationController = require('../controllers/application-controller');
var projectController = require('../controllers/project-controller');

// Export an array of routes
module.exports = [

	//
	// Application routes
	// -----------------------------------

	{
		method: 'GET',
		path: '/',
		handler: applicationController.index // This is the "what" for a given route
	},

	{
		method: 'POST',
		path: '/project',
		handler: projectController.create,
		config: {
			payload: {
				output: 'stream',
				parse: true,
				allow: 'multipart/form-data'
			},
			validate: {
				query: {
					name: Joi.string().regex(CLEAN_STRING_REGEX).required(),
					id: Joi.string().regex(CLEAN_STRING_REGEX).required()
				}
			}
		}
	},

	//
	// Static assets
	// -----------------------------------

	{
		method: '*',
		path: '/{path*}',
		handler: {
			directory: {
				path: 'public',
				listing: true
			}
		}
	},
];

