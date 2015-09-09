'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var assert = require('assert');

var describe = lab.describe;
var it = lab.it;

var server = require('../../index');

describe('set of tests', function () {
	it('should succeed with a GET to /', function (done) {
		server.inject({ url: '/' }, function (res) {
			assert.equal(res.statusCode, 200);
			done();
		});
	});
});

