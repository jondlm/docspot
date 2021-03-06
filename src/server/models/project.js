'use strict';

var _         = require('lodash');
var fs        = require('fs-extra');
var path      = require('path');
var Boom      = require('boom');
var tar       = require('tar');
var sortFiles = require('../util/sort').sortFiles;
var settings  = require('../config/settings');

var UPLOAD_DIR  = settings.uploadsDir;
var PROJECT_DIR = settings.projectsDir;

module.exports = {
	/**
	 * all
	 *
	 * List all projects
	 *
	 * @return {Promise} - (files: array) => {}
	 */
	all: function() {
		return new Promise(function(resolve, reject) {
			fs.readdir(PROJECT_DIR, function(err, files) {
				if (err) {
					return reject(Boom.badImplementation(err));
				}

				var folders = _.filter(files, function(file) {
					return file !== '.gitkeep';
				});

				return resolve(folders);
			});
		});
	},

	/**
	 * create
	 *
	 * Create a new project/build by uploading a tarball
	 *
	 * @param {string} projectId
	 * @param {string} buildId
	 * @param {boolean} [isLatest] - if true, we'll symlink the build as the "latest"
	 * @param {object} data - should be the hapi payload for a multipart upload, implements readable stream
	 * @return {Promise} - () => {}
	 */
	create: function(projectId, buildId, file, isLatest) {
		return new Promise(function(resolve, reject) {
			var uploadDir = path.join(UPLOAD_DIR, projectId);
			var targetDir = path.join(PROJECT_DIR, projectId, buildId);
			var latestDir = path.join(PROJECT_DIR, projectId, 'latest');

			if (file) {
				var name     = file.hapi.filename;
				var filename = path.join(uploadDir, Date.now() + '-' + buildId + '.tar.gz');

				if (!(_.endsWith(name, '.tar.gz') || _.endsWith(name, '.tgz'))) {
					return reject(Boom.badData('You must upload a .tar.gz or .tgz file'));
				}

				if (buildId === 'latest') {
					return reject(Boom.badData('buildId cannot be set to "latest"'));
				}

				fs.mkdirs(uploadDir, function(err) {
					if (err) {
						return reject(Boom.badImplementation(err));
					}

					var fileWriteStream = fs.createWriteStream(filename);

					fileWriteStream.on('error', function(fileErr) {
						return reject(Boom.badImplementation(fileErr));
					});

					file.pipe(fileWriteStream);

					file.on('end', function() {
						fs.mkdirs(targetDir, function(mkdirErr) {
							if (mkdirErr) {
								return reject(Boom.badImplementation(mkdirErr));
							}

							var extract = fs.createReadStream(filename).pipe(tar.x({ cwd: targetDir }));

							extract.on('error', function(extractErr) {
								return reject(Boom.badImplementation(extractErr));
							});

							extract.on('end', function() {
								if (isLatest) {
									fs.remove(latestDir, function() {
										fs.ensureSymlink(targetDir, latestDir, function(symlinkErr) {
											if (symlinkErr) {
												return reject(Boom.badImplementation(symlinkErr));
											}

											return resolve();
										});
									});
								} else {
									return resolve();
								}
							});
						});
					});
				});

			} else {
				return reject(Boom.badData('Missing file, please use the "file" key for your form-data'));
			}

		});
	},

	/**
	 * builds
	 *
	 * `projects` have many `builds`
	 *
	 * @param {string} projectId - the project id to scope the rest of the calls to
	 * @return {object} - returns a closed over set of functions for further `build` operations
	 */
	builds: function(projectId) {
		return {
			/**
			 * all
			 *
			 * List all builds for the current project
			 *
			 * @return {Promise} - (builds: array) => {}
			 */
			all: function() {
				return new Promise(function(resolve, reject) {
					var readPath = path.join(PROJECT_DIR, projectId);

					fs.readdir(readPath, function(err, files) {
						if (_.get(err, 'code') === 'ENOTDIR') {
							return reject(Boom.badImplementation(projectId + ' is not a directory'));
						}

						if (err) {
							return reject(Boom.notFound(projectId + ' was not found'));
						}

						return resolve(sortFiles(files));

					});
				});
			},

			/**
			 * destroy
			 *
			 * Destroy the given build
			 *
			 * @param {string} buildId
			 * @return {Promise} - () => {}
			 */
			destroy: function(buildId) {
				return new Promise(function(resolve, reject) {
					var deletePath = path.join(PROJECT_DIR, projectId, buildId);

					fs.remove(deletePath, function(err) {
						if (err) {
							return reject(Boom.notFound(projectId + '/' + buildId + ' was not found'));
						}

						return resolve();
					});
				});
			}
		};
	},

	/**
	 * destroy
	 *
	 * Destroy the given project
	 *
	 * @param {string} projectId
	 * @return {Promise} - () => {}
	 */
	destroy: function(projectId) {
		return new Promise(function(resolve, reject) {
			var deletePath = path.join(PROJECT_DIR, projectId);

			fs.remove(deletePath, function(err) {
				if (err) {
					return reject(Boom.notFound(projectId + ' was not found'));
				}

				return resolve();
			});
		});
	},

};

