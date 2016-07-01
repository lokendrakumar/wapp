var app = module.exports = require('express')();
var _ = require('lodash');

var fn = require('fn');
var view = require('view').prefix('site');
var pages = 
require('apps/site/pages');

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
      console.log(post)
      if (post === undefined) {
        res.status(404).render(view('pages/404'));
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
              title: title,
              profile: data.user,
              post: post,
              partials: pages.post
            };
            htmlResponse(req, res, pages.post, args);
          },
          function (apiRes) { 
            if(apiRes.statusCode === 404) {
              res.status(404).render(view('pages/404')); 
            }
          }
        );
      } else {
        res.status(404).render(view('pages/404'));
      }
    },
    function (err) {
      res.status(404).render(view('pages/404'));
    });
});

/**
 * user post page
 */
app.get('/q/:questionId', function (req, res) {
  getQuestion(req.params.questionId, req.token)
    .then(
      function (post) {
        if (post.question) {
          getUser(post.question.to.username, req.token).then(
            function (data) { 
              var args = {
                pagename: 'post',
                title:post.question.to.name+ " | " +post.question.body ,
                post: post,
                profile: data.user,
                partials: pages.post
              };
              // args to be loaded into view
              htmlResponse(req, res, pages.post, args);
            },
            function (apiRes) { 
              if(apiRes.statusCode === 404) {
                res.status(404).render(view('pages/404')); 
              }
            }
          );
        } else {
          res.status(404).render(view('pages/404'));
        }
      },
      function (err) {
        res.status(500).render(view('pages/500'));
      }
    );
});