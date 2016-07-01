var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');
var api = require('api');
var partials = require('apps/widgets/partials');
var fn = require('fn');
var view = require('view').prefix('widgets');
var categories = require('categories');
var render = fn.views.render;
var htmlResponse = fn.views.htmlResponse;
var getUser = fn.data.getUser;
var getUserAnswers = fn.data.getUserAnswers;
var getFeedPost = fn.data.getFeedPost;
var getOpenAnswers = fn.data.getOpenAnswers;
var usernameFilter = fn.filters.usernameFilter;
var getSurvey = fn.data.getSurvey;
var getVideoComments = fn.data.getVideoComments;
var getUserFeed = fn.data.getUserFeed;
var getprofilefeed = fn.data.getProfileFeed;


app.get('/userWidgetBatch/:username', function (req, res) {
  var user = _.isUndefined(req.params.username) ? null : req.params.username;
  var link = _.isUndefined(req.query.link) ? "/" + user : req.query.link;
  var pageNum = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  var parentUrl = _.isUndefined(req.query.url) ? null : req.query.url;
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
              partials: partials.userWidgetBatch,
              answers: data.items.filter(function (i) {
                return i.type === 'answer';
              })
                .map(function (i) {
                  return i.model;
                }),
              link: link,
              nav: false,
              header: true,
              container: false,
              pageNum: data.next_index,
              parentUrl: parentUrl

            };

            htmlResponse(req, res, partials.userWidgetBatch, args);

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


app.get('/userWidgetSm/:username', usernameFilter, function (req, res) {
  var parentUrl = _.isUndefined(req.query.url) ? null : req.query.url;
  Promise.props({
    user: getUser(req.resolved.user.username, req.token, true),
    feed: getUserAnswers(req.resolved.user, 0, req.token, true)
  }).then(
    function (data) {
      var args = {
        pagename: 'userWidgetSm',
        nav: false,
        partials: partials.userWidgetSmall,
        title: 'Frankly.me | Ask me anything',
        feed: data.feed.items.filter(function (i) {
                return i.type === 'answer';
              }).map(function (i) {
                  return i;
              }),
        user: data.user,
        header: false,
        container: false,
        parentUrl: parentUrl
      };
      res.render(partials.userWidgetSmall.main, args);
    },
    function () {
      res.status(500).render("Error");
    }
  );
});


app.get('/userWidgetLg/:username', usernameFilter, function (req, res) {
  var parentUrl = _.isUndefined(req.query.url) ? null : req.query.url;
  getUser(req.resolved.user.username, req.token, true)
    .then(
    function (data) {
      var args = {
        pagename: 'userWidgetLg',
        nav: false,
        partials: partials.userWidgetLarge,
        title: 'Frankly.me | Ask me anything',
        user: data.user,
        container: false,
        header: false,
        parentUrl: parentUrl
      };
      res.render(partials.userWidgetLarge.main, args);
    },
    function () {
      res.status(500).render('');
    }
  );

});

app.get('/openQuestionWidget/:username/:questionSlug', function (req, res) {
  var params = {};
  var offset = _.isUndefined(req.query.page) ? 0 : parseInt(req.query.page);
  var parentUrl = _.isUndefined(req.query.url) ? null : req.query.url;
  var flagRedirect = _.isUndefined(req.query.flagRedirect) ? false : req.query.flagRedirect;
  getUser(req.params.username, req.token, true)
    .then(function (data) {
      params.user = data.user;
      return getFeedPost(data.user, req.params.questionSlug, req.token, true);
    }).then(function (post) {
      if (post.redirect === true) {
        res.redirect(post.location.replace('/slug', ''));
        return;
      }
      if (!post.question.is_open) {
        res.status(404).send('This is not an open question');
        return;
      }
      params.question = post.question;
      return getOpenAnswers(post.question.id, offset, req.token, true);
    }).then(function (feed) {

      if (!feed) {
        return;
      }
      var args = {

        pagename: 'openQuestionWidget',
        nav: false,
        partials: partials.openQuestionWidget,
        title: 'Frankly.me | Ask me anything',
        post: params,
        question: params.question,
        answers: feed.items.filter(function (i) {
          return i.type === 'answer';
        })
          .map(function (i) {
            return i.model;
          }),
        offset: feed.next_index,
        header: false,
        container: false,
        parentUrl: parentUrl,
        flagRedirect: flagRedirect

      };
      htmlResponse(req, res, partials.openQuestionWidget, args);
      //res.render(partials.openQuestionWidget.main, args);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).render(view('pages/404'));
    });
});

app.get('/askButtonLg/:username', function (req, res) {
  var username = _.isUndefined(req.params.username) ? null : req.params.username;
  var parentUrl = _.isUndefined(req.query.url) ? null : req.query.url;

  var args = {
    pagename: 'askButtonLg',
    nav: false,
    partials: partials.askButtonLarge,
    title: 'Frankly.me | Ask me anything',
    username: username,
    container: false,
    header: false,
    parentUrl: parentUrl
  };
  res.render(partials.askButtonLarge.main, args);
});

app.get('/videoComment', function (req, res) {
  var url = req.query.url || 'www.test.com';
  var locationUrl = url.split('#');
  var sourceUrl = locationUrl[0].replace(/\/$/, '').replace('https', 'http');
  var args = {
    pagename: 'videoComment',
    nav: false,
    partials: partials.videoComment,
    title: 'Frankly.me | Ask me anything',
    sourceUrl: sourceUrl,
    //username: username,
    //container: false,
    header: false,
    //parentUrl: parentUrl
  };
  res.render(partials.videoComment.main, args);
});


app.get('/askButtonSm/:username', function (req, res) {
  var username = _.isUndefined(req.params.username) ? null : req.params.username;
  var parentUrl = _.isUndefined(req.query.url) ? null : req.query.url;
  var args = {
    pagename: 'askButtonSm',
    nav: false,
    partials: partials.askButtonSmall,
    title: 'Frankly.me | Ask me anything',
    username: username,
    header: false,
    parentUrl: parentUrl
  };
  res.render(partials.askButtonSmall.main, args);
});


app.get('/velfieHome', function (req, res) {

  var args = {
    pagename: 'askButtonSm',
    nav: false,
    partials: partials.velfieHome,
    title: 'Frankly.me | Ask me anything',
    username: 'username',
    header: false,
    container:false
  };
  htmlResponse(req, res, partials.velfieHome, args);
});




app.get('/openProfile', function (req, res) {

  var args = {
    pagename: 'askButtonSm',
    nav: false,
    partials: partials.openProfile,
    title: 'Frankly.me | Ask me anything',
    username: 'username',
    header: false,
    container:false
  };
  htmlResponse(req, res, partials.openProfile, args);
});

app.get('/openNotifications', function (req, res) {

  var args = {
    pagename: 'askButtonSm',
    nav: false,
    partials: partials.openNotifications,
    title: 'Frankly.me | Ask me anything',
    username: 'username',
    header: false,
    container:false
  };
  htmlResponse(req, res, partials.openNotifications, args);
});



app.get('/openQuestionPage/:username/:questionSlug', function (req, res) {

  var params = {};
  var pageNum = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  getUser(req.params.username, req.token)
    .then(function (data) {
      params.user = data.user;
      return getFeedPost(data.user, req.params.questionSlug, req.token);
    }).then(function (post) {
      //console.log(post);
      if (post.redirect === true) {
        res.redirect(post.location.replace('/slug', ''));
        return;
      }
      if (!_.isObject(post.question) && !_.isObject(post.answer)) {
        res.status(404).send('pages/404');
        return;
      }
      params.question = post.question;
      return getOpenAnswers(post.question.id, pageNum, req.token, 'openQuestionPage', 12);
    }).then(function (feed) {
      if (!feed) {
        return;
      }
      var args = {
        pagename: 'openQuestionPage',
        title: params.question.from.name+' | '+params.question.body,
        post: params,
        nav: false,
        header: false,
        partials: partials.openQuestionPage,
        container: true,
        question: params.question,
        description: params.question.description,
        user: params.user,
        answers: feed.items.filter(function (i) {
          return i.type === 'answer';
        })
          .map(function (i) {
            return i.model;
          }),
        pageNum: feed.next_index
      };
      htmlResponse(req, res, partials.openQuestionPage, args);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).render(view('pages/404'));
    });
});


/*audition route
*/
app.get('/survey/:username/:surveyId', usernameFilter, function (req, res) {
  Promise.props({
    user: getUser(req.resolved.user.username, req.token, true),
    survey: getSurvey(req.params.surveyId)
  }).then(function(data){
    var args = {
      pagename: 'widgetAudition',
      nav: false,
      partials: partials.widgetAudition,
      title: 'Frankly.me | Ask me anything',
      user: data.user.user,
      survey: data.survey.survey_entry,
      userId: data.user.user.id,
      createrId : data.survey.survey_entry.created_by.id,
      container: false,
      header: false
    };
    console.log(args.survey);
    if (args.userId == args.createrId) {
      res.render(partials.widgetAudition.main, args);
    } else {
      res.status(404).render(view('pages/404'));
    }
  })
});

app.get('/viewComment', function (req, res) {
  var url = req.query.url || 'www.test.com';
  var locationUrl = url.split('#');
  var sourceUrl = locationUrl[0].replace(/\/$/, '').replace('https', 'http');
  Promise.props({
    comments : getVideoComments(sourceUrl, req.query.offset, req.query.limit)
  }).then(function(data){
    var args = {
      pagename: 'viewVideoComment',
      nav: false,
      partials: partials.viewVideoComment,
      title: 'Frankly.me | Ask me anything',
      comments: data.comments,
      container: false,
      header: false,
      offset: data.comments.next_index,
      sourceUrl: sourceUrl
    };
    //res.send(data);
    res.render(partials.viewVideoComment.main, args);
  })
});

app.get('/openQuestionAnswers/:username/:questionSlug', function (req, res) {

  var params = {};
  var offset = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  getUser(req.params.username, req.token)
    .then(function (data) {
      params.user = data.user;
      return getFeedPost(data.user, req.params.questionSlug, req.token);
    }).then(function (post) {
      //console.log(post);
      if (post.redirect === true) {
        res.redirect(post.location.replace('/slug', ''));
        return;
      }
      if (!_.isObject(post.question) && !_.isObject(post.answer)) {
        res.status(404).send('pages/404');
        return;
      }
      params.question = post.question;
      return getOpenAnswers(post.question.id, offset, req.token, 'openQuestion', 4);
    }).then(function (feed) {
      if (!feed) {
        return;
      }
      var args = {
        pagename: 'openQuestion',
        title: params.question.from.name+' | '+params.question.body,
        post: params,
        nav: false,
        header: false,
        partials: partials.openQuestion,
        container: false,
        question: params.question,
        description: params.question.description,
        user: params.user,
        answers: feed.items.filter(function (i) {
          return i.type === 'answer';
        })
          .map(function (i) {
            return i.model;
          }),
        offset: feed.next_index
      };
      htmlResponse(req, res, partials.openQuestion, args);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).render(view('pages/404'));
    });
});


app.post('/imageUpload',function(req,res){
  console.log(req.params);
  api.post('/openquestion/edit' , {
    json : {
      banner_image:req.query.img

    },
    token : req.token
  }).then(function(data) {
    console.log(data);
  }, function(err) {
    res.send(400).send({
      msg : 'failed'
    });
  });
});

/**
 * user profile page
 */
app.get('/profile/:username', function (req, res) {
  var offset = 0;
  var userName = _.isUndefined(req.query.username) ? req.params.username : req.query.username;
  var feedParam = _.isUndefined(req.query.feedParam) ? 'All' : req.query.feedParam;
  var PostIndex = (req.query.postIndex === undefined) ? 0 : req.query.postIndex;
  var QuestionIndex = (req.query.questionIndex === undefined) ? 0 : req.query.questionIndex;
  var AllIndex = (req.query.userIndex === undefined) ? 0 : req.query.userIndex;
  if (feedParam === 'Post') {
    offset = PostIndex;
  }
  else if (feedParam === 'Question') {
    offset = QuestionIndex;
  }
  else {
    offset = AllIndex;
  }
  Promise.props({
    user: getUser(userName, req.token)
  }).then(function (data) {
    getprofilefeed(data.user.user, offset, data.user.user.token, feedParam).then(
      function (feed) {
        var PostIndexValue = function (feed) {
          if (feedParam === 'Post') {
            return feed.next_index;
          }
          else {
            return PostIndex;
          }
        };
        var QuestionIndexValue = function (feed) {
          if (feedParam === 'Question') {
            return feed.next_index;
          }
          else {
            return QuestionIndex;
          }
        };
        var UserIndexValue = function (feed) {
          if (feedParam === 'All') {
            return feed.next_index;
          }
          else {
            return AllIndex;
          }
        };
        var args = {
          pagename: 'profile',
          title: 'Ask ' + data.user.user.name + ' anything on Frankly.me',
          partials: partials.profile,
          profile: data.user.user,
          feed: feed,
          postIndexValue: PostIndexValue(feed),
          questionIndexValue: QuestionIndexValue(feed),
          userIndexValue: UserIndexValue(feed),
          user: data.user.user,
          pageNum: feed.next_index
        };

        htmlResponse(req, res, partials.profile, args);
      },
      function () {
        res.status(500).render(view('partials/500'));
      }
    );
  });
});

app.get('/:username/:questionSlug', function (req, res) {
  var params = {};
  var offset = _.isUndefined(req.query.page) ? 0 : parseInt(req.query.page);
  getUser(req.params.username, req.token)
    .then(function (data) {
      params.user = data.user;
      return getFeedPost(data.user, req.params.questionSlug, req.token);
    }).then(function (post) {
      if (!_.isObject(post.question) && !_.isObject(post.answer)) {
        res.status(404).render(view('partials/404'));
        return;
      } else if (post.is_answered || !post.question.is_open) {
        if (post.is_answered) {
          var title = post.answer.author.name + ' | ' + post.answer.question.body;
        } else {
          var title = post.question.to.name + ' | ' + post.question.body;
        }
        // args to be loaded into view
        var args = {
          pagename: 'post',
          title: title,
          user: params.user,
          header: false,
          nav: false,
          container: false,
          questionSlug: post.is_answered ? false : true,
          post: post,
          partials: partials.post
        };
        htmlResponse(req, res, partials.post, args);
        return;
      }
      else{
        res.status(404).render(view('pages/404'));
      }

  })
});
