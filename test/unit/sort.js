'use strict';

var lab = exports.lab = require('lab').script();
var assert = require('assert');
var describe = lab.describe;
var it = lab.it;

var sort = require('../../src/server/util/sort');
var sortFiles = sort.sortFiles;

describe('sort', function() {
	describe('#sortFiles', function() {
		it('should sort with no semver files and a latest', function(done) {
			assert.deepEqual(
				sortFiles(['a', 'c', 'latest', 'b']),
				['latest', 'a', 'b', 'c']
			);
			done();
		});

		it('should sort with no semver files and no latest', function(done) {
			assert.deepEqual(
				sortFiles(['a', 'c', 'b']),
				['a', 'b', 'c']
			);
			done();
		});

		it('should sort with semver files and latest', function(done) {
			assert.deepEqual(
				sortFiles(['a', 'c', 'b', 'latest', 'v0.0.5', 'v3.6.12', 'v7.0.0', 'v0.0.1', '0.5.0', '0.55.0']),
				['latest', 'v7.0.0', 'v3.6.12', '0.55.0', '0.5.0', 'v0.0.5', 'v0.0.1', 'a', 'b', 'c']
			);
			done();
		});

		it('should sort with semver files no latest', function(done) {
			assert.deepEqual(
				sortFiles(['a', 'c', 'b', 'v0.0.5', 'v3.6.12', 'v7.0.0', 'v0.0.1', '0.5.0', '0.55.0']),
				['v7.0.0', 'v3.6.12', '0.55.0', '0.5.0', 'v0.0.5', 'v0.0.1', 'a', 'b', 'c']
			);
			done();
		});

		it('should handle real world semver values', function(done) {
			var result = sortFiles([ 'v3.6.10', 'v3.6.11', 'v3.6.12', 'v3.6.8', 'v3.6.9', 'v3.7.0', 'v3.7.1', 'v3.7.2', 'v3.7.3', 'v3.7.4', 'v3.7.5', 'v5.2.1', 'v7.0.0', 'v7.0.1', 'v7.0.2', 'v7.1.0', 'v7.1.1', 'v7.2.0', 'v7.2.1', 'v7.2.2', 'v7.2.3', 'v7.3.0', 'v7.4.0', 'v7.5.0', 'v7.5.1' ]);
			var expected = [
				'v7.5.1',
				'v7.5.0',
				'v7.4.0',
				'v7.3.0',
				'v7.2.3',
				'v7.2.2',
				'v7.2.1',
				'v7.2.0',
				'v7.1.1',
				'v7.1.0',
				'v7.0.2',
				'v7.0.1',
				'v7.0.0',
				'v5.2.1',
				'v3.7.5',
				'v3.7.4',
				'v3.7.3',
				'v3.7.2',
				'v3.7.1',
				'v3.7.0',
				'v3.6.12',
				'v3.6.11',
				'v3.6.10',
				'v3.6.9',
				'v3.6.8',
			];
			assert.deepEqual(result, expected);
			done();
		})
	});
});
