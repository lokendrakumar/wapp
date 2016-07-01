var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');
var passport = require('passport');
var xssFilters = require('xss-filters');


var api = require('api');
var partials = require('apps/newsite/partials');
var fn = require('fn');
var view = require('view').prefix('newsite');
var categories = require('categories');

var render = fn.views.render;
var toRender = fn.views.toRender;
var renderAll = fn.views.renderAll;
var htmlResponse = fn.views.htmlResponse;

var getCategories = fn.data.getCategories;
var getMe = fn.data.getMe;
var getUser = fn.data.getUser;
var getUserFeed = fn.data.getUserFeed;
var getCategoryFeed = fn.data.getCategoryFeed;
var getCategoryUsers = fn.data.getCategoryUsers;
var getFeedPost = fn.data.getFeedPost;
var getDiscoverFeed = fn.data.getDiscoverFeed;
var getQuestion = fn.data.getQuestion;
var getMyFeed = fn.data.getMyFeed;
var getTrending = fn.data.getTrending;
var getOpenQuestions = fn.data.getOpenQuestions;
var getOpenAnswers = fn.data.getOpenAnswers;
var getUserFeedQuestion = fn.data.getUserFeedQuestion;

var usernameFilter = fn.filters.usernameFilter;
var categoryFilter = fn.filters.categoryFilter;
var authFilter = fn.filters.authFilter;
var unauthFilter = fn.filters.unauthFilter;
var addComment = fn.data.addComment;
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
    partials: pages.feed,
    deepLink: "android-app://me.frankly/http/frankly.me/feed" 

  };

  Promise.props(promises).then(function (data) {
    _.extend(args, data);
    args.questionIndex = data.questions.next_index;
    args.postIndex = data.feed.next_index;
    args.userIndex = data.users.next_index;
    htmlResponse(req, res, pages.feed, args);
  });
});

/**
 * user feed-trending page
 */
app.get('/feed-trending', authFilter, function (req, res) {
  var questionIndex = _.isUndefined(req.query.questionIndex) ? 0 : parseInt(req.query.questionIndex);
  //var postIndex = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  var userIndex = _.isUndefined(req.query.userIndex) ? 0 : parseInt(req.query.userIndex);

  var promises = {
    //feed: getMyFeed(postIndex, req.token),
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

/**
 * ask a question to a user
 * REQUIRES AUTH FILTER
 */
app.post('/ask/:userId', authFilter, function (req, res) {
  if (req.body.question.is_anonymous === 'true') {
    var isAnonymous = 1;
  } else {
    isAnonymous = 0;
  }
  if (req.body.question.widget === 'true') {
    var widgetValue = true;
  } else {
    var widgetValue = false;
  }
  api.post("/question/ask", {
    json: {
      question_to: req.params.userId,
      is_anonymous: isAnonymous,
      body: xssFilters.inHTMLData(req.body.question.body),
    },
    token: req.token,
    widget: widgetValue
  }).then(
    function (data) {
      req.query.partials = ['questionCard'];
      htmlResponse(req, res, partials.common, data);
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    }
  );
});

app.post('/:answerId/comments', authFilter, function (req, res) {
  var answerId = req.params.answerId;
  var body = req.body.body;
  addComment(answerId, body, req.token)
    .then(
    function () {
      res.send({msg: 'success'});
    },
    function () {
      res.status(400).send({msg: 'fail'});
    }
  );
});


/**
 * ask a question to a user
 * REQUIRES AUTH FILTER
 */
app.post('/openquestion/ask/:userId', authFilter, function (req, res) {
  if (req.body.question.is_anonymous === 'true') {
    var isAnonymous = 1;
  } else {
    isAnonymous = 0;
  }
  if (req.body.question.widget === 'true') {
    var widgetValue = true;
  } else {
    var widgetValue = false;
  }
  api.post('/openquestion/ask', {
    formData: {
      body: xssFilters.inHTMLData(req.body.question.body),
    },
    token: req.token,
    widget: widgetValue
  }).then(
    function (data) {
      req.query.partials = ['openQuestionCard'];
      var post = {question: data.question, user: data.question.from};
      var answers = data.posts;
      data = {
        post: post,
        answers: []
      };

      htmlResponse(req, res, partials.common, data);
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    }
  );
});

/**
 * increment video
 */
app.post('/view', function (req, res) {
  api.get('/videoview', {
    qs: {url: req.body.vurl},
    token: req.token
  }).then(
    function (data) {
      res.send({msg: 'success'});
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    }
  );
});



/**
 * request answer from a user
 * REQUIRES AUTH FILTER
 */
app.post('/request-answer/:questionId', authFilter, function (req, res) {
  api.post('/question/upvote/' + req.params.questionId, {token: req.token}).then(
    function (data) {
      res.send({msg: 'success'});
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    }
  );
});

/**
 * downvote/unrequest answer from a user
 * REQUIRES AUTH FILTER
 */
app.post('/downvote-answer/:questionId', authFilter, function (req, res) {
  api.post('/question/downvote/' + req.params.questionId, {token: req.token}).then(
    function (data) {
      res.send({msg: 'success'});
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    }
  );
});

/**
 * follow/unfollow a user
 * REQUIRES AUTH FILTER
 * params - userId
 */
app.post('/follow/:userId', authFilter, function (req, res) {

  api.post('/user/follow', {
    json: {user_id: req.params.userId},
    token: req.token
  }).then(
    function (data) {
      res.send({msg: 'success'});
    },
    function (res) {
      res.status(400).send({msg: 'failed'});
    }
  );
});

/**
 * reset password
 * Requires - forgotPasswordTokenFilter*
 * Params - password
 * */
app.post('/reset-password', function (req, res) {
  api.post('/forgotpassword/reset/' + req.body.resetToken, {
    json: {password: req.body.password},

  }).then(
    function (data) {
      res.send({msg: 'success'});
    },
    function (res) {
      console.log(res);
      res.status(400).send({msg: 'failed'});
    }
  );
});

/**
 * Unfollow user
 * requires - authfilter
 * params - userId
 */
app.post('/unfollow/:userId', authFilter, function (req, res) {
  api.post('/user/unfollow', {
    json: {user_id: req.params.userId},
    token: req.token
  }).then(
    function (data) {
      res.send({msg: 'success'});
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    }
  );
});

/**
 * like/unlike answer
 * REQUIRES AUTH FILTER
 */
app.post('/like/:answerId', authFilter, function (req, res) {
  api.post('/post/like', {
    json: {post_id: req.params.answerId},
    token: req.token
  }).then(
    function (data) {
      res.send({msg: 'success'});
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    }
  );

});

/**
 * Unlike Answers
 * requires - authFilter
 * params - answerId
 */

app.post('/unlike/:answerId', authFilter, function (req, res) {
  api.post('/post/unlike', {
    json: {post_id: req.params.answerId},
    token: req.token
  }).then(
    function (data) {
      res.send({msg: 'success'});
    },
    function (data) {
      res.status(400).send({msg: 'failed'});
    }
  );
});

/**
 * Get User feeds
 * requires - NA
 * params - userId
 */
app.get('/:user_id/feeds', function (req, res) {
  api.get('/timeline/user/' + req.params.user_id + '/multitype').then(
    function (data) {
      res.send(data);
    },
    function (data) {
      res.status(400).send({msg: 'failed'});
    }
  );
});

//routes to be used in shareCard after recording

/**
 * Get User profile details
 * requires - NA
 * params - NA
 */
app.get('/user/profile/', authFilter, function (req, res) {
  getMe(req.token).then(
    function (data) {
      res.send(data);
    },
    function (error) {
      res.status(400).send({msg: 'failed'});
    }
  );

});

/*
 *Post on fb, twitter and youtube
 *requires - NA
 *params -NA
 */

app.post('/social/post', authFilter, function (req, res) {
  api.post('/user/post_permission',
    {
      json: req.body,
      token: req.token
    }).then(function (data) {
      res.send({msg: " posted"});
    },
    function (error) {
      res.status(400).send({msg: 'post failed'});
    });

});

/**
 * Report Abuse
 * Requires AUTH filter
 */
app.post('/report-abuse', authFilter, function (req, res) {
  console.log(req.body);
  api.post('/reportabuse ', {
    json: {
      object_id: req.body.id,
      object_type: req.body.type,
      reason: 'default'
    },
    token: req.token
  }).then(
    function (data) {
      console.log(data);
      res.send({msg: 'success'});
    },
    function (err) {
      console.log(err);
      res.status(400).send({msg: err});
    }
  );
});
