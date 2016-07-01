var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');
var passport = require('passport');

var api = require('api');
var fn = require('fn');
var view = require('view').prefix('campaigns');
var categories = require('categories');
var pages = require('apps/campaigns/partials');

var toRender = fn.views.toRender;
var renderAll = fn.views.renderAll;
var htmlResponse = fn.views.htmlResponse;

var getUser = fn.data.getUser;
var getUserFeed = fn.data.getUserFeed;
var getFeedPost = fn.data.getFeedPost;
var getFeatured = fn.data.getFeatured;
var getOpenQuestions = fn.data.getOpenQuestions;

var usernameFilter = fn.filters.usernameFilter;

/**
 * user showcase page
 */
app.get('/:username', usernameFilter, function (req, res) {
  var description = true ;
 /* if (req.query.intro) {
    description = true;
  };*/
  Promise.props({
    user: getUser(req.resolved.user.username, req.token),
    openQuestions: getOpenQuestions(req.resolved.user, 0, req.token),
  }).then(function (data) {
    var args = {
      pagename: 'openQuestionPage',
      title: 'Ask '+ req.resolved.user.username+' anything on Frankly.me',
      partials: pages.campaign,
      profile: req.resolved.user,
      user: data.user.user,
      description: description,
      openQuestions: data.openQuestions.items.map(function (obj) {
        return obj.model.slug;
      }),
    };
    htmlResponse(req, res, pages.campaign, args);
  }).catch(function (err) {
    console.log(err);
    res.status(500).send(view('pages/500'));
  });
});