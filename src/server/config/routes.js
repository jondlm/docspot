//
// Routes
// -----------------------------------------------------------------------------
//
// This should contain all the routes for the application. Keeping them in one
// location helps on-board new developers and keeps things tidy. If this grows
// to be huge, it sometimes makes sense to break the routes into their own
// files, but I wouldn't recommend it unless we have 100+ routes or so.

var _        = require('lodash');
var Joi      = require('joi');
var log      = require('../util/log');
var settings = require('./settings');

var safeStringSchema = Joi
	.string()
	.regex(/^[a-zA-Z0-9\._-]{1,255}$/)
	.replace('..', '-')
	.replace('/', '-');

//
// Controllers
// -------------------------------------

var projectsController = require('../controllers/projects-controller');

// Export an array of routes
module.exports = [

	//
	// Application routes
	// -----------------------------------

	{
		method: 'GET',
		path: '/',
		handler: function(request, reply) {
			return reply.view('index');
		}
	},

	//
	// Projects routes
	// -----------------------------------

	{
		method: 'GET',
		path: '/api/projects',
		handler: projectsController.list,
		config: {
			validate: {
				query: {
					name: safeStringSchema
				}
			}
		}
	},

	{
		method: 'DELETE',
		path: '/api/projects',
		handler: projectsController.destroy,
		config: {
			validate: {
				query: Joi.object().keys({
					name: safeStringSchema.required(),
					id: safeStringSchema
				}).with('id', 'name')
			}
		}
	},

	{
		method: 'POST',
		path: '/api/projects',
		handler: projectsController.create,
		config: {
			payload: {
				output: 'stream',
				parse: true,
				allow: 'multipart/form-data'
			},
			validate: {
				query: {
					name: safeStringSchema.required(),
					id: safeStringSchema.required()
				}
			}
		}
	},

	//
	// Static assets
	// -----------------------------------

	{
		method: 'GET',
		path: '/{path*}',
		handler: {
			directory: {
				path: 'public',
				listing: true
			}
		}
	}
];

