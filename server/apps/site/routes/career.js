var app = module.exports = require('express')();
var _ = require('lodash');

var view = require('view').prefix('site');
var pages = require('apps/site/pages');

app.get('/career/productmanager', function (req, res) {
  var args = {
    pagename: 'productmanager'
  };
  res.render(pages.productmanager.main, args);
});