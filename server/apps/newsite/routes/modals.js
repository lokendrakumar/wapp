var app = module.exports = require('express')();
var _ = require('lodash');

var view = require('view').prefix('site');
var fn = require('fn');
var api = require('api');
var pages = require('apps/site/pages');

/**
 * auth modal html
 */
app.get('/modal/auth', function (req, res) {
  res.render(pages.modals.auth, {partials: pages.common});
});

/**
 * video upload modal html
 */
app.get('/modal/video', function (req, res) {
  res.render(pages.modals.recordVideo);
}); 

/**
 * answerVideo modal html
 */
app.get('/modal/answer-video/:answerId', function (req, res) {
  api.get('/post/view/'+req.params.answerId, {token: req.token})
    .then(
      function (data) {
        res.render(pages.modals.answerVideo, {answer: data.answer, partials: pages.common});
      },
      function (apiRes) {
        res.status(404).render(view('404'));
      });
});

/**
 * profileVideo modal html
 */
app.get('/modal/profile-video/:userId', function (req, res) {
  api.get('/user/profile/'+req.params.userId, {token: req.token}).then(
    function (data) {
      res.render(pages.modals.profileVideo, {profile: data.user, partials: pages.common});
    },
    function (apiRes) {
      res.status(404).render(view('404'));
    }
  );
});

/**
 * askQuestion modal html
 */
app.get('/modal/ask-question/:userId', function (req, res) {
  api.get('/user/profile/'+req.params.userId, {token: req.token}).then(
    function (data) {
      res.render(pages.modals.askQuestion, {profile: data.user, partials: pages.common});
    },
    function (apiRes) {
      res.status(404).render(view('404'));
    }
  );
});