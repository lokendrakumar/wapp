var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');

var pages = require('apps/site/pages');
var recorder = require('apps/recorder/pages');
var api = require('api');
var fn = require('fn');
var view = require('view').prefix('site');

var render = fn.views.render;
var toRender = fn.views.toRender;
var renderAll = fn.views.renderAll;
var htmlResponse = fn.views.htmlResponse;

var usernameFilter = fn.filters.usernameFilter;

var getFeedPost = fn.data.getFeedPost;
var getFeatured = fn.data.getFeatured;
var getUserFeed = fn.data.getUserFeed;
var getUser = fn.data.getUser;
var getUserAnswers = fn.data.getUserAnswers;
var getUserQuestion = fn.data.getUserQuestion;
var getQuestion = fn.data.getQuestion;
var getOpenAnswers = fn.data.getOpenAnswers;

/** 
 * Embeds Showcase Page
 */
/*app.get('/embed', function (req, res) {
  var args = {
    pagename: 'embed',
    title: 'Frankly.me Embed Widgets',
    //profile: req.resolved.user,
    partials: pages.popups
  };

  res.render(pages.popups.embed, args);
});*/

/** 
 * Ask Question Popup
 */
app.get('/ask/:username/question/', usernameFilter, function (req, res) {
  Promise.props({
    users: getFeatured(null, 'users', 4, 0, req.token),
    feed: getUserFeed(req.resolved.user, 1, req.token),
    question: getUserQuestion(req.resolved.user, 0)
  }).then(function (data) {
    //console.log(data);
    var args = {
      pagename: 'askPopup',
      title: 'Ask ' + req.resolved.user.name,
      profile: req.resolved.user,
      partials: pages.popups,
      users: data.users.items.map(function (i) { return i.model; })
                        .filter(function (u) { return u.id !==  req.resolved.user.id; })
                        .slice(0, 3),
      answers: data.feed.items.filter(function (i) { return i.type === 'answer'; })
                        .map(function (i) { return i.model; })
                        .slice(0, 3),
      questions: data.question,
    };
    res.status(301).redirect('/widgets/ask/'+ req.params.username + '/question/');
    //htmlResponse(req, res, pages.popups, args);
  }).catch(function (err) {
    console.log(err);
    res.status(500).send(view('pages/500'));
  });
});

/**
 * User answering popup
 */
app.get('/popup/plugin/:questionId/answer', function (req, res) {
  var pageNum = _.isUndefined(req.query.page) ? 1 : parseInt(req.query.page);
  getQuestion(req.params.questionId, req.token)
    .then(function (post) {
      getOpenAnswers(req.params.questionId, pageNum, req.token)
        .then(function (data) {
          var args = {
            
            pagename: 'answeringPopup',
            title: (post.question.is_open ? post.question.from.name : post.question.to.name)+' | '+post.question.body,
            post: post,
            partials: pages.popups.answeringPopup,
            question: post.question,
            answers: data.items.filter(function (i) { return i.type === 'answer'; })
                                .map(function (i) { return i.model; }),
            pageNum: pageNum

          };
         htmlResponse(req, res, pages.popups.answeringPopup, args);
        });
        

    })
    .catch(function () {
      res.status(404).render(view('pages/404'));
    });
});

app.get('/popup/question/:username', usernameFilter, function (req, res) {
  var offset = parseInt(req.query.offset) || 0;
  console.log('loke')
  getUserQuestion(req.resolved.user, offset)
    .then(function (data) {
      var args = {
        pagename: 'questions',
        title: 'Ask ' + req.resolved.user.name,
        questions: data,
        partials: pages.popups,
      };
      htmlResponse(req, res, pages.popups, args);
    });
});

/** 
 * User Reply Popup page
 */
app.get('/popup/plugin/:username/:questionSlug', usernameFilter, function (req, res) {
  getFeedPost(req.resolved.user, req.params.questionSlug, req.token)
    .then(function (post) {
      // args to be loaded into view
      var args = {
        pagename: 'replyPopup',
        title: title,
        profile: req.resolved.user,
        user: req.resolved.user,
        post: post,
        partials: pages.popups
      };

      if (post.is_answered) {
        var title = post.answer.author.name+' | '+post.answer.question.body;
        args.answer = post.answer;
        args.a = post.answer;
      } else {
        var title = post.question.to.name+' | '+post.question.body;
      }
      
      htmlResponse(req, res, pages.popups, args);
      //res.render(pages.popups.previousReply, args);
    });
});

app.get('/widget/userWidgetBatch', function (req, res) {
  var user = _.isUndefined(req.query.user) ? null : req.query.user;
  var link = _.isUndefined(req.query.link) ? "/"+user : req.query.link;
  var pageNum = _.isUndefined(req.query.postIndex) ? 1 : parseInt(req.query.postIndex);
  if (!user) {
    res.status(404).render(view('site/pages/404'));
  } else {
    getUser(user, req.token).then(
      function (data) {
        var userData = data.user;
        getUserAnswers(userData, pageNum, req.token)
          .then(function (data) {
            var args = {
              pagename: 'userWidgetBatch',
              title: 'Ask '+user+' anything on Frankly.me',
              user: userData,
              partials: pages.userWidgetBatch,
              answers: data.items.filter(function (i) { return i.type === 'answer'; })
                                .map(function (i) { return i.model; }),
              link: link,
              pageNum: data.next_index,
            };
            htmlResponse(req, res, pages.userWidgetBatch, args);
            
          });
      },
      function (apiRes) { 
        if(apiRes.statusCode === 404) {
          res.status(404).render(view('site/pages/404')); 
        }
      }
    );
  }
});

