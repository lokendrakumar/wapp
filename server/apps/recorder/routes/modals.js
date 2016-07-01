var app = module.exports = require('express')();
var _ = require('lodash');

var view = require('view').prefix('site');
var fn = require('fn');
var api = require('api');
var pages = require('apps/recorder/pages');

/**
 * auth modal html
 */
 
app.get('/modal/auth', function (req, res) {
  res.render(pages.recorder.auth, {partials: pages.recorder});
});
