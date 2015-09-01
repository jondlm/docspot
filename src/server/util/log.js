//
// Log
// -----------------------------------------------------------------------------
// This is a singleton logger so that anything in the app can refer to the
// same logging instance.
//
// Examples:
// log.fatal('Oh boy oh berto');
// log.error('Your mom goes to %s', 'college');
// log.warn('You have something on your face');
// log.info({ key: 'value' }, 'Sloths are slow');
// log.debug('A request came in');
// log.trace({ payload: obj }'A request came in');
//
// Suggestions: Use "debug" sparingly. Information that will be useful to
// debug errors post mortem should usually be included in "info" messages if
// it's generally relevant or else with the corresponding "error" event.
// Don't rely on spewing mostly irrelevant debug messages all the time and
// sifting through them when an error occurs.

var bunyan = require('bunyan');
var settings = require('../config/settings');

module.exports = bunyan.createLogger(settings.get('bunyan'));

