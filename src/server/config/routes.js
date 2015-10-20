'use strict';
//
// Routes
// -----------------------------------------------------------------------------
//
// This should contain all the routes for the application. Keeping them in one
// location helps on-board new developers and keeps things tidy. If this grows
// to be huge, it sometimes makes sense to break the routes into their own
// files, but I wouldn't recommend it unless we have 100+ routes or so.

var Joi = require('joi');

var safeStringSchema = Joi.string()
	.regex(/^[a-zA-Z0-9\._-]{1,255}$/)
	.replace('..', '-')
	.replace('/', '-');

//
// Controllers
// -------------------------------------

var applicationController = require('../controllers/application-controller');
var projectsController = require('../controllers/projects-controller');

// Export an array of routes
module.exports = [

	//
	// Application routes
	// -----------------------------------

	{
		path: '/',
		method: 'GET',
		handler: applicationController.index
	}, {
		path: '/upload',
		method: 'GET',
		handler: function(request, reply) {
			return reply.view('upload');
		}
	},

	//
	// Projects routes
	// -----------------------------------

	{
		path: '/api/projects',
		method: 'GET',
		handler: projectsController.list,
		config: {
			tags: ['api'],
			notes: ['List all projects.']
		}
	}, {
		path: '/api/projects/{projectId}',
		method: 'GET',
		handler: projectsController.listBuilds,
		config: {
			tags: ['api'],
			notes: ['List all builds for a given project.'],
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
			tags: ['api'],
			notes: [
				'Create a new build given a .tar.gz file, a project ID, and build ID.',
				'If the project does not exist, it will be created. Despite what Swagger ' +
				'says, this must be a multipart/form-data upload. If `isLatest` is set ' +
				'to true, then the uploaded build will be symlinked to "latest".'
			],
			payload: {
				output: 'stream',
				parse: true,
				allow: 'multipart/form-data'
			},
			validate: {
				payload: {
					file: Joi.any().required(),
					projectId: safeStringSchema.required(),
					buildId: safeStringSchema.required(),
					isLatest: Joi.boolean()
				}
			},
			plugins: {
				'hapi-swagger': {
					payloadType: 'form'
				}
			}
		}
	}, {
		path: '/api/projects/{projectId}',
		method: 'DELETE',
		handler: projectsController.destroy,
		config: {
			tags: ['api'],
			notes: ['Delete a project.'],
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
			tags: ['api'],
			notes: ['Delete a build.'],
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

