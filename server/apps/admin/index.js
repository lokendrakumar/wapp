var app = module.exports = require('express')();
var view = require('view').prefix('admin');
var _ = require('lodash');

var partials = require('./partials');
var fn = require('fn');

var htmlResponse = fn.views.htmlResponse;
var getUserFeed = fn.data.getUserFeed;
var usernameFilter = fn.filters.usernameFilter;

app.use(function (req, res, next) {

  res.locals.view = view;

  next();
});
app.use('/', require('./routes/ajax'));
app.use('/', require('./routes/pages'));