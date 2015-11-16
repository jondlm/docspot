'use strict';

var Project = require('../models/project');

module.exports = {

	list: function(request, reply) {
		Project.all().then(function(projects) {
			return reply({
				projects: projects
			});
		}, reply);
	},

	listBuilds: function(request, reply) {
		var projectId = request.params.projectId;

		Project.builds(projectId).all().then(function(builds) {
			return reply({
				project: {
					id: projectId,
					builds: builds
				}
			});
		}, reply);
	},

	destroy: function(request, reply) {
		var projectId = request.params.projectId;

		Project.destroy(projectId).then(function() {
			return reply({
				message: projectId + ' successfully deleted'
			});
		}, reply);
	},

	destroyBuild: function(request, reply) {
		var projectId  = request.params.projectId;
		var buildId    = request.params.buildId;

		Project.builds(projectId).destroy(buildId).then(function() {
			return reply({
				message: projectId + '/' + buildId + ' successfully deleted'
			});
		}, reply);
	},

	create: function(request, reply) {
		var file      = request.payload.file;
		var projectId = request.payload.projectId;
		var buildId   = request.payload.buildId;
		var isLatest  = request.payload.isLatest; // optional

		Project.create(projectId, buildId, file, isLatest).then(function() {
			return reply({
				message: 'Upload and extraction successful, browse to /projects/' + projectId + '/' + buildId
			});
		}, reply);
	}

};

