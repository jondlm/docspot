'use strict';
//
// Routes
// -----------------------------------------------------------------------------
//
// This should contain all the routes for the application. Keeping them in one
// location helps on-board new developers and keeps things tidy. If this grows
// to be huge, it sometimes makes sense to break the routes into their own
// files, but I wouldn't recommend it unless we have 100+ routes or so.

var Joi      = require('joi');

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
		path: '/',
		method: 'GET',
		handler: function(request, reply) {
			return reply.view('index');
		}
	}, {
		path: '/upload',
		method: 'GET',
		handler: function(request, reply) {
			return  reply.view('upload');
		}
	},

	//
	// Projects routes
	// -----------------------------------

	{
		path: '/api/projects',
		method: 'GET',
		handler: projectsController.list
	}, {
		path: '/api/projects/{projectId}',
		method: 'GET',
		handler: projectsController.listBuilds,
		config: {
			validate: {
				params: {
					projectId: safeStringSchema.required(),
				}
			}
		}
	}, {
		path: '/api/projects',
		method: 'POST',
		handler: projectsController.create,
		config: {
			payload: {
				output: 'stream',
				parse: true,
				allow: 'multipart/form-data'
			},
			validate: {
				payload: {
					file: Joi.any(),
					projectId: safeStringSchema.required(),
					buildId: safeStringSchema.required()
				}
			}
		}
	}, {
		path: '/api/projects/{projectId}',
		method: 'DELETE',
		handler: projectsController.destroy,
		config: {
			validate: {
				params: {
					projectId: safeStringSchema.required(),
				}
			}
		}
	}, {
		path: '/api/projects/{projectId}/builds/{buildId}',
		method: 'DELETE',
		handler: projectsController.destroyBuild,
		config: {
			validate: {
				params: {
					projectId: safeStringSchema.required(),
					buildId: safeStringSchema.required()
				}
			}
		}
	},

	//
	// Static assets
	// -----------------------------------

	{
		path: '/{path*}',
		method: 'GET',
		handler: {
			directory: {
				path: 'public',
				listing: true
			}
		}
	}
];

