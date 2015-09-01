'use strict';

var Boom   = require('boom');
var fs     = require('fs');
var _      = require('lodash');
var mkdirp = require('mkdirp');
var tar    = require('tar-fs');
var path   = require('path')
var targz  = require('tar.gz');

module.exports = {

	create: function(request, reply) {
		var data        = request.payload;
		var projectName = request.query.name;
		var id          = request.query.id;
		var uploadDir   = path.join(appRoot, 'public' ,'uploads', projectName);
		var targetDir   = path.join(appRoot, 'public', 'projects', projectName, id);

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
							return reply({message: 'Upload and extraction successful, browse to /' + projectName + '/' + id});
						});
					});
				});
			});

		} else {
			return reply(Boom.badData('Missing file, please use the "file" key for your form-data'));
		}
	}

};

