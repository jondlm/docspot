var _ = require('lodash');
var semver = require('semver');

function sortFiles(files) {
	var files = files || [];

	var sortedFiles = files.sort();
	var hasLatest = _.contains(sortedFiles, 'latest');
	var semverFiles = _.filter(sortedFiles, semver.valid);
	var sortedSemverFiles = semverFiles.sort(semver.rcompare);
	var sortedNonSemverFiles = _.filter(sortedFiles, function(file) {
		return !_.contains(sortedSemverFiles, file);
	});

	var finalFiles = sortedSemverFiles.concat(sortedNonSemverFiles);

	if (hasLatest) {
		return ['latest'].concat(_.without(finalFiles, 'latest'));
	} else {
		return finalFiles;
	}
}

module.exports = {
	sortFiles: sortFiles
};
