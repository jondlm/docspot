'use strict';

var lab = exports.lab = require('lab').script();
var assert = require('assert');
var Joi = require('joi');
var describe = lab.describe;
var it = lab.it;
var fs = require('fs');
var FormData = require('form-data');

var server = require('../../index');

var projectsSchema = Joi.object().keys({
	projects: Joi.array().items(Joi.string())
});

var projectDeleteSchema = Joi.object().keys({
	message: Joi.string()
});

describe('set of tests', function () {
	it('should succeed with a GET to /', function (done) {
		server.inject({ url: '/' }, function (res) {
			assert.equal(res.statusCode, 200);
			done();
		});
	});

	it('should give a valid response with GET to /api/projects', function (done) {
		server.inject({ url: '/api/projects' }, function (res) {
			assert.equal(res.statusCode, 200);
			assert(Joi.validate(res.payload, projectsSchema));
			done();
		});
	});

	it('should return a 404 with GET to /api/projects/nonexistant', function (done) {
		server.inject({ url: '/api/projects/nonexistant' }, function (res) {
			assert.equal(res.statusCode, 404);
			done();
		});
	});

	it('should return a valid response with DELETE to /api/projects/nonexistant', function (done) {
		var req = {
			url: '/api/projects/nonexistant',
			method: 'delete'
		};

		server.inject(req, function (res) {
			assert.equal(res.statusCode, 200);
			assert(Joi.validate(res.payload, projectDeleteSchema));
			done();
		});
	});

	it('should accept a tarball, serve its contents, and allow for deletion', function (done) {
		var randomName = Math.random().toString(32).substring(2);
		var form = new FormData();
		var bufferChunks = [];

		form.append('file', fs.createReadStream('./test/fixtures/test.tar.gz'));
		form.append('buildId', 'test');
		form.append('projectId', randomName);

		form.on('data', function (chunk) {
			bufferChunks.push(new Buffer(chunk));
		});

		form.on('end', function() {
			var buffer = new Buffer.concat(bufferChunks); //eslint-disable-line

			var uploadReq = {
				url: '/api/projects',
				method: 'post',
				payload: buffer,
				headers: form.getHeaders()
			};

			server.inject(uploadReq, function (res) {
				assert.equal(res.statusCode, 200);

				var staticAssetsReq = {
					url: '/projects/' + randomName + '/test/test.json',
					method: 'get'
				};

				server.inject(staticAssetsReq, function (res2) {
					assert.equal(res2.statusCode, 200, 'Failed to retrieve the static file that should have been uploaded, you should delete the following project that is now cruft: ' + randomName);
					assert.equal(JSON.parse(res2.payload).test, 'successful');

					var deleteReq = {
						url: '/api/projects/' + randomName,
						method: 'delete'
					};

					server.inject(deleteReq, function(res3) {
						assert.equal(res3.statusCode, 200, 'Failed to delete project, you should delete the following project that is now cruft: ' + randomName);
						done();
					});
				});
			});
		});


		form.resume();

	});
});

