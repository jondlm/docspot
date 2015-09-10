'use strict';

var lab = exports.lab = require('lab').script();
var assert = require('assert');
var Joi = require('joi');
var describe = lab.describe;
var it = lab.it;

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

});

