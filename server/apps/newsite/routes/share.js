var app = module.exports = require('express')();
var _ = require('lodash');

var fn = require('fn');
var view = require('view').prefix('newsite');
var partials = require('apps/newsite/partials');

var render = fn.views.render;
var renderAll = fn.views.renderAll;
var htmlResponse = fn.views.htmlResponse;

var getPostById = fn.data.getPostById;
var getQuestion = fn.data.getQuestion;
var getUser = fn.data.getUser;

var authFilter = fn.filters.authFilter;
var unauthFilter = fn.filters.unauthFilter;

/**
 * user post page legacy support
 */
app.get('/p/:postShortId', function (req, res) {
  getPostById(req.params.postShortId, req.token)
    .then(function (post) {
      if (post === undefined) {
        res.status(404).render(view('pages/errors/404'));
        return;
      }
      if (post.is_answered) {
        var title = post.answer.author.name+' | '+post.answer.question.body;
      } else {
        var title = post.question.to.name+' | '+post.question.body;
      }
      if (post.answer) {
        getUser(post.answer.author.username, req.token).then(
          function (data) {
            var args = {
              pagename: 'post',
              questionSlug:false,
              title: title,
              user: data.user,
              post: post,
              partials: partials.post,
              deepLink: "android-app://me.frankly/http/frankly.me/p/" + req.params.postShortId

            };
            htmlResponse(req, res, partials.post, args);
          },
          function (apiRes) {
            if(apiRes.statusCode === 404) {
              res.status(404).render(view('pages/errors/404'));
            }
          }
        );
      } else {
        res.status(404).render(view('pages/errors/404'));
      }
    },
    function (err) {
      res.status(404).render(view('pages/errors/s404'));
    });
});

/**
 * skT5IP4 user post page
 */
app.get('/q/:questionId', function (req, res) {
  getQuestion(req.params.questionId, req.token)
    .then(
      function (post) {
        if (post.question) {
          getUser(post.question.to.username, req.token).then(
            function (data) {
              if (post.question.to.name) {
                var title = post.question.to.name+ " | " +post.question.body
              } else {
                var title = post.question.body;
              }
              var args = {
                pagename: 'post',
                title:title ,
                post: post,
                questionSlug:true,
                user: data.user,
                partials: partials.post,
                answers: post.question.answers,
                question: post.question,
                deepLink: "android-app://me.frankly/http/frankly.me/p/" + req.params.questionId

              };
              // args to be loaded into view
              htmlResponse(req, res, partials.post, args);
            },
            function (apiRes) {
              if(apiRes.statusCode === 404) {
                res.status(404).render(view('pages/errors/404'));
              }
            }
          );
        } else {
          res.status(404).render(view('pages/errors/404'));
        }
      },
      function (err) {
        res.status(500).render(view('pages/errors/500'));
      }
    );
});
