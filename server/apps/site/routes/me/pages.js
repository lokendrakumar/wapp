var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');

var fn = require('fn');
var pages = 
require('apps/site/pages');
var view = require('view').prefix('site');

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
      title: 'Ask '+req.user.name+' anything on Frankly.me',
      partials: pages.me,
      profile: req.user,
      feed: feed,
      pageNum: pageNum
    };

    htmlResponse(req, res, pages.me, args);
  });
});

/**
 * user feed page
 */
app.get('/feed', authFilter, function (req, res) {
  var questionIndex = _.isUndefined(req.query.questionIndex) ? 0 : parseInt(req.query.questionIndex);
  var postIndex = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  var userIndex = _.isUndefined(req.query.userIndex) ? 0 : parseInt(req.query.userIndex);

  var promises = {
    feed: getMyFeed(postIndex, req.token),
    questions: getTrending(null, 'questions', 3, questionIndex, req.token),
    users: getTrending(null, 'users', 2, userIndex, req.token)
  };

  var args = {
    pagename: 'feed',
    title: req.user.name,
    profile: req.user,
    partials: pages.feed
  };

  Promise.props(promises).then(function (data) {
    _.extend(args, data);
    args.questionIndex = data.questions.next_index;
    args.postIndex = data.feed.next_index;
    args.userIndex = data.users.next_index;
    htmlResponse(req, res, pages.feed, args);
  });
});

