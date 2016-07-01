var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');

var pages = require('apps/widgets/partials');
var recorder = require('apps/recorder/pages');
var api = require('api');
var fn = require('fn');
var view = require('view').prefix('widgets');


var render = fn.views.render;
var toRender = fn.views.toRender;
var renderAll = fn.views.renderAll;
var htmlResponse = fn.views.htmlResponse;

var usernameFilter = fn.filters.usernameFilter;
var authFilter = fn.filters.authFilter;

var getFeedPost = fn.data.getFeedPost;
var getFeatured = fn.data.getFeatured;
var getUserFeed = fn.data.getUserFeed;
var getUser = fn.data.getUser;
var getUserAnswers = fn.data.getUserAnswers;
var getUserQuestion = fn.data.getUserQuestion;
var getQuestion = fn.data.getQuestion;
var getOpenAnswers = fn.data.getOpenAnswers;
var getUserType = fn.data.getUserType;
var getSurvey = fn.data.getSurvey;
var getSurveyProfiles = fn.data.getSurveyProfiles;


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
    users: getFeatured(null, 'users', 4, 0, req.token, true),
    feed: getUserFeed(req.resolved.user, 1, req.token, true),
    question: getUserQuestion(req.resolved.user, 0, true)
  }).then(function (data) {
    var args = {
      pagename: 'askPopup',
      nav: false,
      title: 'Ask ' + req.resolved.user.name,
      profile: req.resolved.user,
      partials: pages.askPopup,
      users: data.users.items.map(function (i) {
        return i.model;
      })
        .filter(function (u) {
          return u.id !== req.resolved.user.id;
        })
        .slice(0, 4),
      answers: data.feed.items.filter(function (i) {
        return i.type === 'answer';
      })
        .map(function (i) {
          return i.model;
        })
        .slice(0, 4),
      questions: data.question,
      header: false
    };
    htmlResponse(req, res, pages.askPopup, args);
    //res.render(pages.askPopup.main, args);
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
  getQuestion(req.params.questionId, req.token, true)
    .then(function (post) {
      getOpenAnswers(req.params.questionId, pageNum, req.token, true)
        .then(function (data) {
          var args = {

            pagename: 'answeringPopup',
            title: (post.question.is_open ? post.question.from.name : post.question.to.name) + ' | ' + post.question.body,
            post: post,
            partials: pages.popups.answeringPopup,
            question: post.question,
            answers: data.items.filter(function (i) {
              return i.type === 'answer';
            })
              .map(function (i) {
                return i.model;
              }),
            pageNum: pageNum,
            header: false

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
  var limit = parseInt(req.query.limit) || 4;
  getUserQuestion(req.resolved.user, offset, limit, true, req.query.author)
    .then(function (data) {
      var args = {
        pagename: 'questions',
        title: 'Ask ' + req.resolved.user.name,
        profile: req.resolved.user,
        questions: data,
        partials: pages.questionCard,
        header : false
      };
      htmlResponse(req, res, pages.questionCard, args);
    });
});

/**
 * User Reply Popup page
 */
app.get('/popup/plugin/:username/:questionSlug', usernameFilter, function (req, res) {
  getFeedPost(req.resolved.user, req.params.questionSlug, req.token, true)
    .then(function (post) {

      //console.log(post)
      //var commentLength = post.answer.comments.list.length
      //for (var i = 0; i <commentLength ; i++) {
      //
      //  var time = post.answer.comments.list[i].timestamp;
      //  var time = new Date(time * 1000);
      //  post.answer.comments.list[i].commentsTime = time
      //
      //}

      // args to be loaded into view
      var args = {
        pagename: 'replyPopup',
        title: 'title',
        profile: req.resolved.user,
        user: req.resolved.user,
        post: post,
        partials: pages.answerPopup,
        nav: false,
        container: false,
        header: false

      };


      // if (post.is_answered) {
      //   var title = post.answer.author.name+' | '+post.answer.question.body;
      //   args.answer = post.answer;
      //   args.a = post.answer;
      // } else {
      //   var title = post.question.to.name+' | '+post.question.body;
      // }

      htmlResponse(req, res, pages.answerPopup, args);
    });
});

app.get('/getUserType', function (req, res) {
  getUserType(req.query.user_id, req.token)
    .then(function (data) {
      console.log(data);
      res.send(data);
    });
});


app.get('/widget/userWidgetBatch', function (req, res) {
  var user = _.isUndefined(req.query.user) ? null : req.query.user;
  var link = _.isUndefined(req.query.link) ? "/" + user : req.query.link;
  var pageNum = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  if (!user) {
    res.status(404).render(view('site/pages/404'));
  } else {
    getUser(user, req.token, true).then(
      function (data) {
        var userData = data.user;
        getUserAnswers(userData, pageNum, req.token, true)
          .then(function (data) {
            var args = {
              pagename: 'userWidgetBatch',
              title: 'Ask ' + user + ' anything on Frankly.me',
              user: userData,
              partials: pages.userWidgetBatch,
              answers: data.items.filter(function (i) {
                return i.type === 'answer';
              })
                .map(function (i) {
                  return i.model;
                }),
              link: link,
              pageNum: data.next_index,
              header: false
            };
            htmlResponse(req, res, pages.userWidgetBatch, args);

          });
      },
      function (apiRes) {
        if (apiRes.statusCode === 404) {
          res.status(404).render(view('site/pages/404'));
        }
      }
    );
  }
});

app.get('/recorder', function (req, res) {
  var type = _.isUndefined(req.query.type) ? null : req.query.type;
  var resourceId = _.isUndefined(req.query.resourceId) ? null : req.query.resourceId;

  var args = {
    type: type,
    resourceId: resourceId,
    header: false
  }
  res.render(recorder.recorder.main, args);
});


/*route for popup showing roles for audition
*/
app.get('/survey/:username/:surveyId/profiles', usernameFilter, function (req, res) {
  Promise.props({
    user: getUser(req.resolved.user.username, req.token, true),
    survey: getSurvey(req.params.surveyId)
  }).then(function(data){
    var args = {
      pagename: 'auditionPopup',
      nav: false,
      partials: pages.auditionPopup,
      title: 'Frankly.me | Ask me anything',
      user: data.user.user,
      survey: data.survey.survey_entry,
      profiles: data.survey.survey_entry.radio_panel,
      userId: data.user.user.id,
      createrId : data.survey.survey_entry.created_by.id,
      container: false,
      header: false
    };
    if (args.userId == args.createrId) {
      res.render(pages.auditionPopup.main, args);
    } else {
      res.status(404).render(view('pages/404'));
    }
  })
});

/*route for form to be filled for giving audition
*/

app.get('/survey/:surveyId/:profileId/form', authFilter, function (req, res) {
  api.get('/survey/participant_exist/' + req.params.profileId, {
    token: req.token
  })
  .then(function(data){
    var status = data.status;
    var user = req.user;
    if (status === 'You Can Apply For This Profile') {
      var args = {
        pagename: 'auditionPopup',
        nav: false,
        partials: pages.auditionPopup,
        title: 'Frankly.me | Ask me anything',
        container: false,
        header: false,
        user: req.user,
      };
        htmlResponse(req, res, pages.auditionPopup, args);
    } else {
      
      res.send({'status':'applied', user: user});
    }
  });
});  


/*route for apply to specific role (adding aprticipants to profile)
*/
app.post('/survey/:surveyId/:profileId/apply', authFilter, function (req, res) {
  api.post('/survey/' + req.params.surveyId + '/profiles/' + req.params.profileId + '/participants', {
    json: req.body,
    token: req.token
  })
  .then(function(data){
    res.send(data);
  },
  function (err){
    res.status(500).send('error');
  }
  );
});
