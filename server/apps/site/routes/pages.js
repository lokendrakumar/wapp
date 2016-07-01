var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');
var passport = require('passport');

var api = require('api');
var pages = require('apps/site/pages');
var fn = require('fn');
var view = require('view').prefix('site');
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

var usernameFilter = fn.filters.usernameFilter;
var categoryFilter = fn.filters.categoryFilter;
var authFilter = fn.filters.authFilter;
var unauthFilter = fn.filters.unauthFilter;

/**
 * Home page
 */
app.get('/', unauthFilter, function (req, res) {
  
  var categoryId = _.isUndefined(req.query.cat) ? categories.list()[0].id : req.query.cat;
  var selectedCategory = categories.list().filter(function (c) { return c.id === categoryId; })[0];
  if (selectedCategory === undefined) {
    res.status(404).render(view('pages/404'));
  } else {
    api.get('/list/featured/users', {
      qs: { list_id: selectedCategory.id, limit: 7, offset: 0},
      token: req.token
    }).then(
      function (feed) {
        var args = {
          pagename: 'homepage',
          title: 'Frankly.me | Ask me anything',
          partials: pages.home,
          categories: categories.list(),
          selectedCategory: selectedCategory,
          users: feed.items.map(function (i) { return i.model; })
        };
        htmlResponse(req, res, pages.home, args);
        
      },
      function (err) {
        console.log (err);
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
    partials: pages.welcome,
    title: 'Welcome'
  };
  res.render(pages.welcome.main, args);
});

/**
 * category page
 */
app.get('/category/:category', categoryFilter, function (req, res) {
  var validSections = ['franksters', 'activity'];
  var validFilters = ['featured', 'trending'];

  var pageNum = _.isUndefined(req.query.page) ? 1 : parseInt(req.query.page);

  var params = {
    section: validSections.indexOf(req.query.section) > -1 ? req.query.section : validSections[0],
    filter: validFilters.indexOf(req.query.filter) > -1? req.query.filter : validFilters[0]
  };

  var rightPanes = {
    activity: view('partials/category/activityRightPane'),
    franksters: view('partials/category/frankstersRightPane')
  };

  pages.category.rightPane = rightPanes[params.section];

  var args = {
    pagename: 'category',
    section: params.section,
    filter: params.filter,
    title: 'See what people have to say in '+req.resolved.category.name+' on Frankly.me',
    partials: pages.category,
    category: req.resolved.category,
    pageNum: pageNum
  };
  
  if (params.section === 'franksters') {
    getCategoryUsers(req.resolved.category, pageNum, params.filter, req.token)
      .then(
        function (feed) {
          args.feed = feed;
          htmlResponse(req, res, pages.category, args);
        },
        function (err) {
          res.status(500).render(view('pages/500'));
        }
      );
  } else if (params.section === 'activity') {
    getCategoryFeed(req.resolved.category, pageNum, params.filter, req.token)
      .then(
        function (feed) {
          args.feed = feed;
          htmlResponse(req, res, pages.category, args);
        },
        function (err) {
          res.status(500).render(view('pages/500'));
        }
      );
  }
});
/**
 * app discover page
 */
app.get('/discover', function (req, res) {
  var pageNum = req.query.page === undefined ? 1 : parseInt(req.query.page);
  var redirect = req.query.redirect === undefined ? '' : req.query.redirect;
  getDiscoverFeed(pageNum, req.token).then(
    function (props) {
      //console.log(props)
      var args = _.extend({
        pagename: 'discover',
        partials: pages.discover,
        title: 'Discover',
        categories: categories.listAll(),
        pageNum: pageNum,
        velfie: redirect,
        token: req.token
      }, props);
      
      htmlResponse(req, res, pages.discover, args);
      //res.render(pages.discover.main, args);
      
    },
    function (err) {
      res.status(500).render(view('pages/500'));
    }
  );
});



app.get('/ambassador', function (req, res) {
  var args = {
    pagename: 'Ambassador'
  };
  res.render(pages.ambassador.main, args);
});


app.get('/:username/:verificationSlug.html', usernameFilter, function (req, res) {
  var args = {
    pagename: 'verification',
    partials: pages.googleVerification,
    verificationCode: req.params.verificationSlug
  };
  htmlResponse(req, res, pages.googleVerification, args);
});

/**
 * tensports page
 */
// app.get('/tensports', function (req, res) {
//   getUser('tensports', req.token)
//     .then(function (data) {
//       if (_.isUndefined(req.resolved)) req.resolved = {};
//       req.resolved.user = data.user;

//       var pageNum = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
      
//       return getOpenQuestions(req.resolved.user, pageNum, req.token);
//     })
//     .then(function (feed) {
//       //console.log(feed.items[0].model);
//       getOpenAnswers(feed.items[0].model, 0, req.token).then(
//         function (data) {
//           console.log(data.items);
//           var args = {
//             pagename: 'profile',
//             title: 'Talk to '+(req.resolved.user.name || req.resolved.user.username)+' on Frankly.me',
//             partials: pages.tensports,
//             profile: req.resolved.user,
//             feed: feed,
//             postIndex: feed.next_index,
//             question:feed.items[0].model,
//             answers: data.items.filter(function (i) { return i.type === 'answer'; })
//                                 .map(function (i) { return i.model; }),
//             user: req.resolved.user
//           };

//           htmlResponse(req, res, pages.tensports, args);
//         });
//       });
    
// });

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
        res.status(404).render(view('pages/404'));
        return;
      } else if (post.is_answered || ! post.question.is_open) {
        if (post.is_answered) {
          var title = post.answer.author.name+' | '+post.answer.question.body;
        } else {
          var title = post.question.to.name+' | '+post.question.body;
        }
         
        // args to be loaded into view
        var args = {
          pagename: 'post',
          title: title,
          profile: params.user,
          post: post,
          partials: pages.post
        };
        htmlResponse(req, res, pages.post, args);
        return;
      }

      params.question = post.question;
      return getOpenAnswers(post.question.id, offset, req.token);
    }).then(function (feed) {
      if (! feed) {
        return;
      }
      var args = {
        
        pagename: 'answeringPopup',
        title: params.question.from.name+' | '+params.question.body,
        post: params,
        partials: pages.popups.answeringPopup,
        question: params.question,
        answers: feed.items.filter(function (i) { return i.type === 'answer'; })
                            .map(function (i) { return i.model; }),
        offset: feed.next_index

      };
      

      htmlResponse(req, res, pages.popups.answeringPopup, args);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).render(view('pages/404'));
    });    
});

// app.get('/indiatoday/:questionSlug', function (req, res) {
//   var params = {};
//   var offset = _.isUndefined(req.query.page) ? 0 : parseInt(req.query.page);
//   getUser('indiatoday', req.token)
//     .then(function (data) {
//       params.user = data.user;
//       return getFeedPost(data.user, req.params.questionSlug, req.token);
//     }).then(function (post) {
//       if (!_.isObject(post.question) || !post.question.is_open) {
//         res.status(404).render(view('pages/404'));
//         return null;
//       }

//       params.question = post.question;
//       return getOpenAnswers(post.question.id, offset, req.token);
//     }).then(function (feed) {
      
//       if (feed === null) {
//         return;
//       }
//       var args = {
        
//         pagename: 'answeringPopup',
//         title: params.question.from.name+' | '+params.question.body,
//         post: params,
//         partials: pages.popups.answeringPopup,
//         question: params.question,
//         answers: feed.items.filter(function (i) { return i.type === 'answer'; })
//                             .map(function (i) { return i.model; }),
//         offset: feed.next_index

//       };
      
//       htmlResponse(req, res, pages.popups.answeringPopup, args);
//     })
//     .catch(function (err) {
//       console.log(err);
//       res.status(404).render(view('pages/404'));
//     });    
// });

/**
 * user profile page
 */
app.get('/:username', usernameFilter, function (req, res) {
  var pageNum = _.isUndefined(req.query.postIndex) ? 0 : parseInt(req.query.postIndex);
  getUserFeed(req.resolved.user, pageNum, req.token).then(
    function (feed) {
      // args to be loaded into view  
      var args = {
        pagename: 'profile',
        title: 'Ask '+req.resolved.user.name+' anything on Frankly.me',
        partials: pages.profile,
        profile: req.resolved.user,
        feed: feed,
        postIndex: feed.next_index,
      };
      console.log(req.resolved.user.id);
      if (req.user) {
        if (req.user.username === req.resolved.user.username) {
          args.partials = pages.me;
          args.pagename = 'me';
          htmlResponse(req, res, pages.me, args);
        } else {
          htmlResponse(req, res, pages.profile, args);  
        }
      } else {
        htmlResponse(req, res, pages.profile, args);
      }
      
    },
        
    function () {
      res.status(500).render(view('pages/500'));
    }
  );
});


/**
 * user post page
 */
// app.get('/:username/:questionSlug', usernameFilter, function (req, res) {
//   getFeedPost(req.resolved.user, req.params.questionSlug, req.token)
//     .then(
//       function (post) {
//         if (post.is_answered) {
//           var title = post.answer.author.name+' | '+post.answer.question.body;
//         } else {
//           var title = post.question.to.name+' | '+post.question.body;
//         }
        
//         // args to be loaded into view
//         var args = {
//           pagename: 'post',
//           title: title,
//           profile: req.resolved.user,
//           post: post,
//           partials: pages.post
//         };
//         htmlResponse(req, res, pages.post, args);
//       },
//       function (apiRes) {
//         if (apiRes.statusCode === 404) {
//           res.status(404).render(view('pages/404'));
//         } else {
//           res.status(500).render(view('pages/500'));
//         }
//       }
//     );

// });
