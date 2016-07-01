var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');
var passport = require('passport');

var api = require('api');
var fn = require('fn');
var view = require('view').prefix('site');
var categories = require('categories');
var pages = require('apps/site/pages');

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
app.get('/campaign/:username', usernameFilter, function (req, res) {
  var pageNum = _.isUndefined(req.query.page) ? 1 : parseInt(req.query.page);

  var props = {
    featuredUsers: getFeatured(null, 'users', 7, 5, req.token),
    userFeed: getUserFeed(req.resolved.user, pageNum, req.token)
  };

  Promise.props(props).then(function (data) {
    var args = {
      pagename: 'campaign',
      title: 'Ask '+req.resolved.user.name+' anything on Frankly.me',
      partials: pages.campaign,
      profile: req.resolved.user,
      pageNum: pageNum,
      feed: data.userFeed.items.filter(function (item) {
        return item.type === 'answer';
      }).slice(0, 3),
      showcase: data.featuredUsers.items.filter(function (item) {
        return req.resolved.user.id !== item.model.id;
      }).slice(0, 6)
    };

    htmlResponse(req, res, pages.campaign, args);
  });
});

app.get('/yogaday', function (req, res) {
  Promise.props({
    user: getUser('internationalyogaday', req.token),
    openQuestions: getOpenQuestions({'id' : 'b9219f07ed434c93b1d27c71def112c1'}, 0, req.token),
  }).then(function (data) {
    var args = {
      pagename: 'yogaday',
      title: 'International Yoga Day on Frankly.me',
      partials: pages.yogaday,
      profile: {'id' : 'b9219f07ed434c93b1d27c71def112c1', 'username' : 'internationalyogaday'},
      user: data.user.user,
      openQuestions: data.openQuestions.items.map(function (obj) {
        return obj.model.slug;
      }),
    };
    console.log(args.openQuestions);
    htmlResponse(req, res, pages.yogaday, args);
  }).catch(function (err) {
    console.log(err);
    res.status(500).send(view('pages/500'));
  });
});
