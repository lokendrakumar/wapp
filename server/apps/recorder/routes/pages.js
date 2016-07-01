var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');

var pages = require('apps/site/pages');
var recorder = require('apps/recorder/pages');
var api = require('api');
var fn = require('fn');

var render = fn.views.render;
var toRender = fn.views.toRender;
var renderAll = fn.views.renderAll;
var htmlResponse = fn.views.htmlResponse;

app.get('/recorder', function (req, res) {
  var type = _.isUndefined(req.query.type) ? null : req.query.type;
  var resourceId = _.isUndefined(req.query.resourceId) ? null : req.query.resourceId;
  var widget = _.isUndefined(req.query.widget) ? null : req.query.widget;
  var sourceUrl = _.isUndefined(req.query.sourceUrl) ? null : req.query.sourceUrl;
  var args = {
    type: type,
    resourceId: resourceId,
    widget: widget,
    sourceUrl: sourceUrl 
  } 
  htmlResponse(req, res, recorder.recorder, args);
});