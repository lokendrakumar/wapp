var view = require('view').prefix('campaigns');
var _ = require('lodash');

var common = {
  main: view('common/main'),
  top: view('common/top'),
  bottom: view('common/bottom'),
  nav: view('common/nav'),
  auth: view('/components/auth'),
  answerCard: view('/components/answerCard')
};

var partials = module.exports = {
  common: common,
  campaign: _.extend({}, common, {
    panel: view('pages/campaign/panel'),
    header: view('/components/profileHeader')
  })
};
