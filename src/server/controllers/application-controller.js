'use strict';

var _ = require('lodash');
var Project = require('../models/project');

module.exports = {

	index: function(request, reply) {

		Project.all().then(function(projectIds) {
			var buildPromises = _.map(projectIds, function(projectId) {
				return Project.builds(projectId).all().then(function(buildIds) {
					return {
						projectId: projectId,
						builds: buildIds
					};
				}, reply);
			});

			Promise.all(buildPromises).then(function(result) {
				return reply.view('index', {
					projects: result
				});
			}, reply);
		}, reply);

	}

};

