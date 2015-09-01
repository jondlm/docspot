//
// Settings
// -----------------------------------------------------------------------------
// This file helps with configuring your server. The `nconf` library does most
// of the heavy lifting.

var nconf = require('nconf');

// Load configuration with environment variable overrides. This allows you to
// override specific settings with environment variables, e.g. `port=8899`. Use
// the bash friendly `__` to denote object depth.
nconf.env({ separator: '__' }) // underscores are better than colons for unix
 .defaults(require('../../../config.json'));

//
// Export the nconf object
// -------------------------------------
// To get settings from `nconf` use `nconf.get('bunyan:name')` for example

module.exports = nconf;

