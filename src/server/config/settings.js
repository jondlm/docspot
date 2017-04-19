//
// Settings
// -----------------------------------------------------------------------------
// This file helps with configuring your server. We use `nconf` to stitch
// together the config object and `joi` to validate the shape and handle things
// like default values

var nconf  = require('nconf');
var path   = require('path');
var joi    = require('joi');
var mkdirp = require('mkdirp');

// Load configuration with environment variable overrides. This allows you to
// override specific settings with environment variables, e.g. `port=8899`. Use
// the bash friendly `__` to denote object depth.
nconf.env({ separator: '__' }) // underscores are better than colons for unix
	.defaults(require('../../../config/env.json'));

// Use a Joi schema to make sure the config is valid
var schema = joi.object().keys({
	cacheTemplates : joi.boolean(),
	port           : joi.number().min(1).max(65535),
	maxUploadBytes : joi.number(),
	dataDir        : joi.string().replace(/\/+$/g, '').default(path.resolve(__dirname, '..', '..', '..', 'public')),
	bunyan         : joi.object().keys({
		level : joi.string(),
		name  : joi.string(),
	}),
});

var result = joi.validate(nconf.get(), schema, {
	allowUnknown: true, // nconf adds a ton of junk
	stripUnknown: true,
});

if (result.error) {
	throw result.error;
}

var projectsDir = path.resolve(result.value.dataDir, 'projects');
var uploadsDir = path.resolve(result.value.dataDir, 'uploads');

mkdirp.sync(result.value.dataDir);
mkdirp.sync(projectsDir);
mkdirp.sync(uploadsDir);

//
// Export the augmented settings object
// -------------------------------------
module.exports = Object.assign(result.value, {
	projectsDir: projectsDir,
	uploadsDir: uploadsDir,
});

