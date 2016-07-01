var app = module.exports = require('express')();
var view = require('view').prefix('newsite');
var _ = require('lodash');

var partials = require('./partials');
var fn = require('fn');

var htmlResponse = fn.views.htmlResponse;
var getUserFeed = fn.data.getUserFeed;
var usernameFilter = fn.filters.usernameFilter;

app.use(function (req, res, next) {

  res.locals.view = view;

  //res.locals.view = require('view').prefix('newsite');

  next();
});
app.use('/', require('./routes/statics'));
app.use('/', require('./routes/popups'));
app.use('/', require('./routes/campaign'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/blog'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/share'));
app.use('/', require('./routes/me/pages'));
app.use('/', require('./routes/me/ajax'));
app.use('/', require('./routes/ajax'));
app.use('/', require('./routes/pages'));

app.get('/', function (req, res) {
  var args = {
    pagename: 'homepage',
    title: 'Frankly.me | Ask me anything',
    partials: partials.home,
  };
  res.render(partials.home.main, args);
});

/**
 * user profile page
 */
app.get('/:username', usernameFilter, function (req, res) {
  var offset = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  getUserFeed(req.resolved.user, offset, req.token)
    .then(function (feed) {
      // args to be loaded into view  
      var args = {
        pagename: 'profile',
        title: 'Ask ' + req.resolved.user.name + ' anything on Frankly.me',
        partials: partials.profile,
        profile: req.resolved.user,
        feed: feed,
        postIndex: feed.next_index,
        
      };

      if (req.user) {
        if (req.user.username === req.resolved.user.username) {
          args.partials = pages.me;
          args.pagename = 'me';
          htmlResponse(req, res, partials.me, args);
        } else {
          htmlResponse(req, res, partials.profile, args);
        }
      } else {
        htmlResponse(req, res, partials.profile, args);
      }
    }).catch(function (err) {
      res.status(500).render(view('pages/errors/500'));
    });
});