'use strict';

var Boom   = require('boom');
var fs     = require('fs-extra');
var _      = require('lodash');
var tar    = require('tar-fs');
var path   = require('path')
var targz  = require('tar.gz');
var path   = require('path');

var UPLOAD_DIR  = path.join(appRoot, 'public', 'uploads');
var PROJECT_DIR = path.join(appRoot, 'public', 'projects');

module.exports = {

	list: function(request, reply) {
		var name = request.query.name;
		var readPath = PROJECT_DIR;
		var toReturn = {};

		if (name) {
			readPath = path.join(readPath, name);
		}

		fs.readdir(readPath, function(err, files) {
			if (err) {
				return reply(Boom.notFound(name + ' was not found'));
			}

			if (name) {
				toReturn.ids = files;
			} else {
				toReturn.projects = files;
			}

			return reply(toReturn);
		});
	},

	destroy: function(request, reply) {
		var name = request.query.name;
		var id = request.query.id;
		var deletePath = [PROJECT_DIR, name];

		if (id) {
			deletePath.push(id);
		}

		fs.remove(path.join.apply(null, deletePath), function(err) {
			if (err) {
				return reply(Boom.badImplementation(err));
			}

			return reply({
				message: path.join.apply(null, deletePath.slice(1)) + ' successfully deleted'
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
			var filename = path.join(uploadDir, Date.now() + '-' + id + '.tar.gz');

			if (!(_.endsWith(name, '.tar.gz') || _.endsWith(name, '.tgz'))) {
				return reply(Boom.badData('You must upload a .tar.gz or .tgz file'));
			}

			fs.mkdirs(uploadDir, function(err) {
				if (err) {
					return reply(Boom.badImplementation(err));
				}

				var file = fs.createWriteStream(filename);

				file.on('error', function(err) {
					return reply(Boom.badImplementation(err));
				});

				data.file.pipe(file);

				data.file.on('end', function() {
					fs.mkdirs(targetDir, function(err) {
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
			// Call back helllll
			//              lllll
			//               lllll
			//                lllll

		} else {
			return reply(Boom.badData('Missing file, please use the "file" key for your form-data'));
		}
	}

};

