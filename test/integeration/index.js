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

	it('should get test data back with a GET to /example', function (done) {
		server.inject({ url: '/example' }, function (res) {
			assert.deepEqual(JSON.parse(res.payload), [
				{ name: 'frank', age: 42 },
				{ name: 'sue', age: 44 },
				{ name: 'jim', age: 25 },
				{ name: 'joe', age: 35 }
			]);
			done();
		});
	});
});

