var api = require('./api')();
var translators = require('./adminDashboardTranslator');

translators.forEach(function (t) {
  api.translator(t);
});

module.exports = api;