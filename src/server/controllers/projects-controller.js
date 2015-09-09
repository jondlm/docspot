'use strict';

var Boom   = require('boom');
var fs     = require('fs-extra');
var _      = require('lodash');
var path   = require('path');
var targz  = require('tar.gz');

var UPLOAD_DIR  = path.join(appRoot, 'public', 'uploads');
var PROJECT_DIR = path.join(appRoot, 'public', 'projects');

module.exports = {

	list: function(request, reply) {
		fs.readdir(PROJECT_DIR, function(err, files) {
			if (err) {
				return reply(Boom.badImplementation(err));
			}

			return reply({ projects: files });
		});
	},

	listBuilds: function(request, reply) {
		var projectId = request.params.projectId;
		var readPath  = path.join(PROJECT_DIR, projectId);

		fs.readdir(readPath, function(err, files) {
			if (err) {
				return reply(Boom.notFound(projectId + ' not found'));
			}

			return reply({
				project: {
					id: projectId,
					builds: files
				}
			});
		});
	},

	destroy: function(request, reply) {
		var projectId  = request.params.projectId;
		var deletePath = path.join(PROJECT_DIR, projectId);

		fs.remove(deletePath, function(err) {
			if (err) {
				return reply(Boom.notFound(projectId + ' was not found'));
			}

			return reply({
				message: projectId + ' successfully deleted'
			});
		});
	},

	destroyBuild: function(request, reply) {
		var projectId  = request.params.projectId;
		var buildId    = request.params.buildId;
		var deletePath = path.join(
			PROJECT_DIR,
			projectId,
			buildId
		);

		fs.remove(deletePath, function(err) {
			if (err) {
				return reply(Boom.notFound(projectId + '/' + buildId + ' was not found'));
			}

			return reply({
				message: projectId + '/' + buildId + ' successfully deleted'
			});
		});
	},

	create: function(request, reply) {
		var data        = request.payload;
		var projectId   = request.payload.projectId;
		var buildId     = request.payload.buildId;
		var uploadDir   = path.join(UPLOAD_DIR, projectId);
		var targetDir   = path.join(PROJECT_DIR, projectId, buildId);
		var latestDir   = path.join(PROJECT_DIR, projectId, 'latest');

		if (data.file) {
			var name = data.file.hapi.filename;
			var filename = path.join(uploadDir, Date.now() + '-' + buildId + '.tar.gz');

			if (!(_.endsWith(name, '.tar.gz') || _.endsWith(name, '.tgz'))) {
				return reply(Boom.badData('You must upload a .tar.gz or .tgz file'));
			}

			fs.mkdirs(uploadDir, function(err) {
				if (err) {
					return reply(Boom.badImplementation(err));
				}

				var file = fs.createWriteStream(filename);

				file.on('error', function(fileErr) {
					return reply(Boom.badImplementation(fileErr));
				});

				data.file.pipe(file);

				data.file.on('end', function() {
					fs.mkdirs(targetDir, function(mkdirErr) {
						if (mkdirErr) {
							return reply(Boom.badImplementation(mkdirErr));
						}

						var extract = fs.createReadStream(filename).pipe(targz().createWriteStream(targetDir));

						extract.on('error', function(extractErr) {
							return reply(Boom.badImplementation(extractErr));
						});

						extract.on('end', function() {
							fs.ensureSymlink(targetDir, latestDir, function(symlinkErr) {
								if (symlinkErr) {
									return reply(Boom.badImplementation(symlinkErr));
								}

								return reply({message: 'Upload and extraction successful, browse to /projects/' + projectId + '/' + buildId + ' or /projects/' + projectId + '/latest'});
							});
						});
					});
				});
			});
			// Call back helllll
			//              lllll
			//               lllll
			//                lllll

		} else {
			return reply(Boom.badData('Missing file, please use the "file" key for your form-data'));
		}
	}

};

