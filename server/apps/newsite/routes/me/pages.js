var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');
var fn = require('fn');
//var pages = require('apps/site/pages');
var partials = require('apps/newsite/partials');
var view = require('view').prefix('newsite');
var htmlResponse = fn.views.htmlResponse;
var getUserFeed = fn.data.getUserFeed;
var getMyFeed = fn.data.getMyFeed;
var getTrending = fn.data.getTrending;
var authFilter = fn.filters.authFilter;

/**
 * user me page
 */
app.get('/me', authFilter, function (req, res) {
  var pageNum = _.isUndefined(req.query.page) ? 1 : parseInt(req.query.page);
  getUserFeed(req.user, pageNum, req.token).then(function (feed) {
    // args to be loaded into view
    var args = {
      pagename: 'me',
      partials: partials.me,
      profile: req.user,
      feed: feed,
      pageNum: pageNum,
      deepLink: "android-app://me.frankly/http/frankly.me/" + req.user 

    };

    htmlResponse(req, res, partials.me, args);
  });
});

/**
 * user feed page
 */
app.get('/feed', authFilter, function (req, res) {
  //var questionIndex = _.isUndefined(req.query.questionIndex) ? 0 : parseInt(req.query.questionIndex);
  var postIndex = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  //var userIndex = _.isUndefined(req.query.userIndex) ? 0 : parseInt(req.query.userIndex);

  var promises = {
    feed: getMyFeed(postIndex, req.token),
    //questions: getTrending(null, 'questions', 3, questionIndex, req.token),
    //users: getTrending(null, 'users', 2, userIndex, req.token)
  };

  var args = {
    pagename: 'feed',
    title: req.user.name,
    profile: req.user,
    partials: partials.feed,
    columnNumber: 2,
    deepLink: "android-app://me.frankly/http/frankly.me/feed" 

  };

  Promise.props(promises).then(function (data) {
    _.extend(args, data);
    args.pageNum = data.feed.next_index;
    args.items = data.feed.items;
    htmlResponse(req, res, partials.feed, args);
  });

});
