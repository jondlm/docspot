'use strict';

var Boom   = require('boom');
var fs     = require('fs-extra');
var _      = require('lodash');
var mkdirp = require('mkdirp');
var tar    = require('tar-fs');
var path   = require('path')
var targz  = require('tar.gz');
var path   = require('path');

var UPLOAD_DIR  = path.join(appRoot, 'public', 'uploads');
var PROJECT_DIR = path.join(appRoot, 'public', 'projects');

module.exports = {

	list: function(request, reply) {
		fs.readdir(PROJECT_DIR, function(err, files) {
			if (err) {
				return reply(Boom.badImplementation(err));
			}

			return reply({
				projects: files
			});
		});
	},

	create: function(request, reply) {
		var data        = request.payload;
		var projectName = request.query.name;
		var id          = request.query.id;
		var uploadDir   = path.join(UPLOAD_DIR, projectName);
		var targetDir   = path.join(PROJECT_DIR, projectName, id);
		var latestDir   = path.join(PROJECT_DIR, projectName, 'latest');

		if (data.file) {
			var name = data.file.hapi.filename;
			var filename = path.join(uploadDir, id + '.tar.gz');

			if (!(_.endsWith(name, '.tar.gz') || _.endsWith(name, '.tgz'))) {
				return reply(Boom.badData('You must upload a .tar.gz or .tgz file'));
			}

			mkdirp(uploadDir, function(err) {
				if (err) {
					return reply(Boom.badImplementation(err));
				}

				var file = fs.createWriteStream(filename);

				file.on('error', function(err) {
					return reply(Boom.badImplementation(err));
				});

				data.file.pipe(file);

				data.file.on('end', function() {
					mkdirp(targetDir, function(err) {
						if (err) {
							return reply(Boom.badImplementation(err));
						}

						var extract = fs.createReadStream(filename).pipe(targz().createWriteStream(targetDir));

						extract.on('error', function(err) {
							return reply(Boom.badImplementation(err));
						});

						extract.on('end', function() {
							fs.ensureSymlink(targetDir, latestDir, function(err) {
								if (err) {
									return reply(Boom.badImplementation(err));
								}

								return reply({message: 'Upload and extraction successful, browse to /' + projectName + '/' + id + ' or /' + projectName + '/latest'});
							});
						});
					});
				});
			});

		} else {
			return reply(Boom.badData('Missing file, please use the "file" key for your form-data'));
		}
	}

};

