var view = require('view').prefix('newsite');
var _ = require('lodash');


var common = {
  main: view('common/main'),
  top: view('common/top'),
  bottom: view('common/bottom'),
  nav: view('common/nav'),
  pushNotification: view('common/PushNotifications'),
  comments:view('/components/common/comments'),
  answerCard:view('/components/answerCard0'),
  userCard :view('/components/userCard'),
  singleUserCard :view('/components/singleUserCard'),
  questionCard:view('/components/questionCard'),
  auth: view('/components/auth'),
  feed : view('common/feed'),
  feedColumn : view('common/feedColumn'),
  openQuestionCard: view('/components/openQuestion')

};

var partials = module.exports = {
  common: common,

  home: _.extend({}, common, {
    main: view('pages/home/main'),
    top: view('pages/home/top'),
    // bottom: view('pages/home/bottom'),
    panel: view('pages/home/panel'),
    section1: view('pages/home/section1'),
    section2: view('pages/home/section2'),
    section3: view('pages/home/section3'),
    section4: view('pages/home/section4'),
    section5: view('pages/home/section5'),
    section6: view('pages/home/section6'),
  }),

  profile: _.extend({}, common, {
    panel: view('pages/profile/panel'),
    header: view('/components/profileHeader'),
    feed: view('pages/profile/feed'),
    feedPanel: view('pages/profile/feedPanel'),
    userBio: view('pages/profile/userBio'),
    askQuestion: view('pages/profile/askQuestion'),
    profileall: view('pages/profile/profileallpanel'),
    feedColumn : view('pages/profile/feedColumn')
  }),

  feed: _.extend({}, common, {
    createVideo  : view('pages/feed/createVideo'),
    // feed : view('pages/feed/feed'),
    panel : view('pages/feed/panel')
  }),

  settings: _.extend({}, common, {
    panel : view('pages/settings/panel')
  }),

  me : _.extend({}, common, {
    panel : view('pages/me/panel'),
  }),

  discover : _.extend({}, common, {
    panel : view('pages/discover/panel'),
    categoryList : view('pages/discover/categoryList'),
    feedHolder: view('pages/discover/feedHolder'),
  }),

  post : _.extend({}, common, {
    panel: view('pages/post/panel'),
    header: view('/components/profileHeader'),
    feed: view('pages/post/feed'),
  }),

  category : _.extend({}, common, {
    panel : view('pages/category/panel'),
    categoryList: view('pages/category/categoryList'),
    // categoryFeed: view('pages/category/categoryFeed'),
    // feed: view('pages/category/feed'),
  }),

  campaign: _.extend({}, common, {
    panel: view('pages/campaign/panel'),
  }),

  authSuccess: _.extend({}, common, {
    panel: view('pages/login/success')
  }),

  statics: {
    hiring:  _.extend({}, common, {panel: view('pages/statics/hiring/panel')}) ,
    about:  _.extend({}, common, {panel: view('pages/about/panel')}),
    contact:  _.extend({}, common, {panel: view('pages/contact/panel')}),
    privacy:  _.extend({}, common, {panel: view('pages/privacy/panel')}),
    resetPassword:  _.extend({}, common, {panel: view('pages/statics/resetPassword')}),
    tos: _.extend({}, common, {panel: view('pages/tos/panel')}),
    team: _.extend({}, common, {panel: view('pages/team/team')}),
    loginPage: _.extend({}, common, {panel: view('pages/loginPage/loginPage')})
  },

  googleVerification: {
    main: view('pages/googleVerification/googleVerification')
  },

  blogs: _.extend({}, common, {
    panel: view('pages/blog/panel'),
    header: view('/components/profileHeader'),
    feed: view('pages/blog/feed'),
    feedPanel: view('pages/blog/feedPanel'),
    userBio: view('pages/blog/userBio'),
    askQuestion: view('pages/blog/askQuestion'),
    profileall: view('pages/blog/profileallpanel')
  }),

  search: _.extend({}, common, {
    panel: view('pages/search/panel'),
    header: view('pages/search/header')
    // feed: view('pages/search/feed')
  }),
  notification: _.extend({}, common, {
    panel: view('pages/notification/panel'),
    feed: view('pages/notification/feed')

  }),
  authentication:_.extend({},common, {
    main: view('pages/authentication/main'),
    top: view('pages/authentication/top'),
    bottom: view('pages/authentication/top'),
    panel: view('pages/authentication/panel'),

  }),



};
