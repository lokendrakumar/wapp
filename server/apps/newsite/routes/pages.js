var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');
var passport = require('passport');

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
var getDiscoverFilteredFeed = fn.data.getDiscoverFilteredFeed;
var getQuestion = fn.data.getQuestion;
var getMyFeed = fn.data.getMyFeed;
var getTrending = fn.data.getTrending;
var getOpenQuestions = fn.data.getOpenQuestions;
var getOpenAnswers = fn.data.getOpenAnswers;
var getUserFeedQuestion = fn.data.getUserFeedQuestion;
var getprofilefeed = fn.data.getProfileFeed;
var getSearchData = fn.data.getSearchData;
var getNotificationData = fn.data.getNotificationData;

var usernameFilter = fn.filters.usernameFilter;
var categoryFilter = fn.filters.categoryFilter;
var authFilter = fn.filters.authFilter;
var unauthFilter = fn.filters.unauthFilter;
var username;

/**
 * app discover page
 */
app.get('/discover', function (req, res) {
  var offset = req.query.postIndex === undefined ? 0 : parseInt(req.query.postIndex);
  var useroffset = req.query.userPostIndex === undefined ? 0 : parseInt(req.query.userPostIndex);
  var useroffset = useroffset + 3;
  var categoryName = req.query.category_Name === undefined ? 'featured' : req.query.category_Name;
  var redirect = req.query.redirect === undefined ? '' : req.query.redirect;
  getDiscoverFilteredFeed(offset, useroffset, req.token, categoryName).then(
    function (props) {
      var args = _.extend({
        pagename: 'discover',
        partials: partials.discover,
        title: 'Discover',
        feed: props.featuredFeed,
        moreUser: props.moreUser,
        categoryName: categoryName,
        categories: categories.listAll(),
        pageNum: props.featuredFeed === undefined ? -1 : props.featuredFeed.next_index,
        useroffset: useroffset,
        velfie: redirect,
        token: req.token,
        columnNumber: 3,
        deepLink: "android-app://me.frankly/http/frankly.me/discover"

      }, props);
      htmlResponse(req, res, partials.discover, args);
      // args.feed.items.forEach(function (ev) {
      //   if (ev.type == 'user_list'){
      //     ev.user_list.forEach(function (e) {
      //       console.log(e);
      //     })
      //   }
      // });
      //res.render(partials.discover.main, args);
    },
    function (err) {
      res.status(500).render(view('pages/errors/500'));
    }
  );
});

/**
 * app discover page
 */
app.get('/settings', authFilter, function (req, res) {
  var args = {
    pagename: 'settings',
    partials: partials.settings,
    title: 'Settings',
    token: req.token,
    deepLink: "android-app://me.frankly/http/frankly.me/settings"
  };

  htmlResponse(req, res, partials.settings, args);
});

/**
 * Search results
 */

app.get('/search', function (req, res) {
  var offset = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  getSearchData(req.query.searchcontent, offset, req.token).then(function (data) {
    var args = {
      pagename: 'Search',
      partials: partials.search,
      title: 'results of' + req.query.searchcontent,
      feed: data,
      header: 'Search Result for \"' + req.query.searchcontent + '\"',
      searchText: req.params.searchcontent,
      columnNumber: 2,
      pageNum: data.next_index
    };
    htmlResponse(req, res, partials.search, args);
  });
});

/**
 * notification page
 */

app.get('/notification', authFilter, function (req, res) {
  var offset = 0;
  var type = (req.query.feedParam === undefined) ? 'me' : req.query.feedParam;
  var newsindex = (req.query.newsindex === undefined) ? 0 : req.query.newsindex;
  var nextindex = (req.query.postIndex === undefined) ? 0 : req.query.postIndex;
  if (type === 'me') {
    offset = nextindex;
  }
  else if (type === 'news') {
    offset = newsindex;
  }

  getNotificationData(req.token, offset, type)
    .then(
    function (feed) {
      if (type === 'me') {
        nextindex = feed.next_index;
      }
      else if (type === 'news') {
        newsindex = feed.next_index;
      }
      var args = {
        pagename: 'notification page',
        title: 'notifications',
        partials: partials.notification,
        data: feed,
        nextindex: nextindex,
        newsindex: newsindex,
        deepLink: "android-app://me.frankly/http/frankly.me/notification"

      };
      htmlResponse(req, res, partials.notification, args);

    },
    function (err) {
      res.status(500).render(view('pages/errors/500'));
    }
  );
});

/**
 * Home page
 */
app.get('/', unauthFilter, function (req, res) {
  var categoryId = _.isUndefined(req.query.cat) ? categories.list()[0].id : req.query.cat;
  var selectedCategory = categories.list().filter(function (c) { return c.id === categoryId; })[0];
  if (selectedCategory === undefined) {
    res.status(404).render(view('pages/errors/404'));
  } else {
    api.get('/list/featured/users', {
      qs: {list_id: selectedCategory.id, limit: 7, offset: 0},
      token: req.token
    }).then(
      function (feed) {
        var args = {
          pagename: 'homepage',
          title: 'Frankly.me | Ask me anything',
          partials: partials.home,
          categories: categories.list(),
          selectedCategory: selectedCategory,
          users: feed.items.map(function (i) { return i.model; })
        };
        htmlResponse(req, res, partials.home, args);

      },
      function (err) {
        res.status(500).render(view('pages/errors/500'));
      }
    );
  }
});

/**
 * app welcome page
 */
app.get('/welcome', function (req, res) {
  var args = {
    pagename: 'welcome',
    partials: partials.welcome,
    title: 'Welcome'
  };
  res.render(partials.welcome.main, args);
});

/**
 * category page
 */
app.get('/category/:category/:icon', categoryFilter, function (req, res) {
  var categoryFilter = req.query.category_Name === undefined ? 'franksters' : req.query.category_Name;
  var offset = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  offset = offset;
  var args = {
    pagename: 'category',
    title: 'See what people have to say in ' + req.resolved.category.name + ' on Frankly.me',
    partials: partials.category,
    category: req.resolved.category.slug,
    icon: req.params.icon,
    categoryName: categoryFilter,
    columnNumber: 3
  };
  if (categoryFilter === 'franksters') {
    getCategoryUsers(req.resolved.category, offset, req.token)
      .then(
      function (feed) {
        args.feed = feed;
        args.pageNum = feed.next_index;
        htmlResponse(req, res, partials.category, args);
      },
      function (err) {
        res.status(500).render(view('pages/errors/500'));
      }
    );
  } else if (categoryFilter === 'activity') {

    getCategoryFeed(req.resolved.category, offset, req.token)
      .then(
      function (feed) {
        args.feed = feed;
        args.pageNum = feed.next_index;
        htmlResponse(req, res, partials.category, args);
      },
      function (err) {
        res.status(500).render(view('pages/errors/500'));
      }
    );
  }
});

// app.post('/sortdiscover', function(req, res){

//   var categoryName = req.body.category_Name===undefined ? 'featured' :req.body.category_Name;

// })

app.get('/:username/:verificationSlug.html', usernameFilter, function (req, res) {
  var args = {
    pagename: 'verification',
    partials: partials.googleVerification,
    verificationCode: req.params.verificationSlug
  };
  htmlResponse(req, res, partials.googleVerification, args);
});

app.get('/:username/:questionSlug', function (req, res) {
  var params = {};
  var offset = _.isUndefined(req.query.page) ? 0 : parseInt(req.query.page);
  getUser(req.params.username, req.token)
    .then(function (data) {
      params.user = data.user;
      return getFeedPost(data.user, req.params.questionSlug, req.token);
    }).then(function (post) {
      if (post.redirect === true) {
        res.redirect(post.location.replace('/slug', ''));
        return;
      }

      if (!_.isObject(post.question) && !_.isObject(post.answer)) {
        res.status(404).render(view('pages/errors/404'));
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
          questionSlug: post.is_answered ? false : true,
          post: post,
          partials: partials.post
        };
        htmlResponse(req, res, partials.post, args);
        return;
      }

      params.question = post.question;
      return getOpenAnswers(post.question.id, offset, req.token);
    }).then(function (feed) {

      if (!feed) {
        return;
      }
      var args = {

        pagename: 'answeringPopup',
        title: params.question.from.name + ' | ' + params.question.body,
        post: params,
        question: params.question,
        answers: feed.items.filter(function (i) { return i.type === 'answer'; })
          .map(function (i) { return i.model; }),
        offset: feed.next_index

      };
      res.redirect("/widgets/openQuestionPage/"+req.params.username+"/"+req.params.questionSlug);
      //htmlResponse(req, res, partials.popups.answeringPopup, args);
    })
    .catch(function (err) {
      //console.log(err);
    });
});

/**
 * user profile page
 */
app.get('/:username', function (req, res) {
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
          pageNum: feed.next_index,
          deepLink: "android-app://me.frankly/http/frankly.me/" + userName

        };

        htmlResponse(req, res, partials.profile, args);
      },
      function () {
        res.status(500).render(view('pages/errors/500'));
      }
    );
  });
});
