'use strict';

var Project = require('../models/project');

module.exports = {

	list: function(request, reply) {
		Project.all().then(reply, reply);
	},

	listBuilds: function(request, reply) {
		var projectId = request.params.projectId;

		Project.builds(projectId).all().then(reply, reply);
	},

	destroy: function(request, reply) {
		var projectId = request.params.projectId;

		Project.destroy(projectId).then(reply, reply);
	},

	destroyBuild: function(request, reply) {
		var projectId  = request.params.projectId;
		var buildId    = request.params.buildId;

		Project.builds(projectId).destroy(buildId).then(reply, reply);
	},

	create: function(request, reply) {
		var file      = request.payload.file;
		var projectId = request.payload.projectId;
		var buildId   = request.payload.buildId;

		Project.create(projectId, buildId, file).then(reply, reply);
	}

};

