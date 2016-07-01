var view = require('view').prefix('site');
var _ = require('lodash');

var common = {
  main: view('pages/std'),
  top: view('partials/layout/top'),
  bottom: view('partials/layout/bottom'),
  nav: view('partials/layout/nav'),
  modals: view('partials/layout/modals'),
  comments: view('partials/common/comments'),
  questionLg: view('partials/common/questionLg'),
  questionSm: view('partials/common/questionSm'),
  answerLg: view('partials/common/answerLg'),
  answerSm: view('partials/common/answerSm'),
  userSm: view('partials/common/userSm'),
  playableAnswerSm: view('partials/common/playableAnswerSm'),
  postCardNoHead: view('partials/common/postCardNoHead'),

};

var campaigns = {
  main: view('/campaigns/common/main'),
  top: view('/campaigns/common/top'),
  bottom: view('/campaigns/common/bottom'),
  nav: view('/campaigns/common/nav'),
  auth: view('/components/auth'),
  answerCard: view('/components/answerCard')
};


var pages = module.exports = {
  common: common,

  profile: _.extend({}, common, {
    panel: view('partials/profile/panel'),
    leftPane: view('partials/profile/leftPane'),
    rightPane: view('partials/profile/rightPane'),
    feed: view('partials/common/postsFeed'),
    askBox: view('partials/profile/askBox')
  }),

  feed: _.extend({}, common, {
    panel: view('partials/feed/panel'),
    leftPane: view('partials/profile/leftPane'),
    feed: view('partials/common/postsFeed'),
    question: view('partials/common/questionLg'),
    answer: view('partials/common/answerLg')
  }),

  me: _.extend({}, common, {
    panel: view('partials/me/panel'),
    leftPane: view('partials/me/leftPane'),
    rightPane: view('partials/me/rightPane'),
    askBox: view('partials/me/askBox'),
    feed: view('partials/me/postsFeed'),
    answerableQuestionLg: view('partials/me/answerableQuestionLg'),
    myAnswerLg: view('partials/me/myAnswerLg')
  }),

  post: _.extend({}, common, {
    panel: view('partials/profile/panel'),
    leftPane: view('partials/profile/leftPane'),
    rightPane: view('partials/post/rightPane')
  }),

  postMe: _.extend({}, common, {
    panel: view('partials/profile/panel'),
    leftPane: view('partials/me/leftPane'),
    rightPane: view('partials/post/rightPane')
  }),

  category: _.extend({}, common, {
    panel: view('partials/category/panel'),
    feed: view('partials/common/postsFeed'),
    leftPane: view('partials/category/leftPane'),
    // IMPORTANT set activity right pane according to the page
    // in the route which renders a category
    rightPane: null,
    ////////////////////////////////////////
    trendingQuestions: view('partials/category/trendingQuestions'),
    trendingQuestionsWidget: view('partials/category/trendingQuestionsWidget'),
    banner: view('partials/category/banner')
  }),

  discover: _.extend({}, common, {
    panel: view('partials/discover/panel'),
    wall: view('partials/discover/wall'),
    questionsSmall: view('partials/discover/questionsSmall'),
    answersSmall: view('partials/discover/answersSmall'),
    questionsLarge: view('partials/discover/questionsLarge'),
    answersLarge: view('partials/discover/answersLarge'),
    usersLarge: view('partials/discover/usersLarge'),
    feed: view('partials/discover/feed')
  }),

  welcome: _.extend({}, common, {
    panel: view('partials/welcome/panel'),
    wall: view('partials/discover/wall')
  }),

  login: _.extend({}, common, {
    panel: view('partials/login/panel')
  }),

  authSuccess: _.extend({}, common, {
    panel: view('partials/login/success')
  }),

  modals: {
    answerVideo: view('partials/modals/answerVideo'),
    askQuestion: view('partials/modals/askQuestion'),
    profileVideo: view('partials/modals/profileVideo'),
    auth: view('partials/modals/auth'),
    recordVideo: view('partials/upload/upload')
  },

  home: _.extend({}, common, {
    panel: view('partials/home/panel'),
    news: view('partials/home/news'),
    showcase: view('partials/home/showcase')
  }),

  campaign: _.extend({}, common, {
    main: view('pages/campaign'),
  }),

  statics: {
    hiring:  _.extend({}, common, {panel: view('pages/statics/hiring')}) ,
    about:  _.extend({}, common, {panel: view('pages/statics/about')}),
    contact:  _.extend({}, common, {panel: view('pages/statics/contact')}),
    privacy:  _.extend({}, common, {panel: view('pages/statics/privacy')}),
    resetPassword:  _.extend({}, common, {panel: view('pages/resetPassword')}),
    tos: _.extend({}, common, {panel: view('pages/statics/tos')}),
    loginPage: _.extend({}, common, {panel: view('pages/loginPage')})
  },

  popups: _.extend({}, common, {
    top : view('pages/userWidgetBatch/top'),
    bottom : view('pages/userWidgetBatch/bottom'),
    main: view('pages/popups/main.ejs'),
    embed: view('pages/popups/embed.ejs'),
    nav: view('pages/popups/nav.ejs'),
    panel: view('pages/popups/panel.ejs'),
    askPopup: view('pages/popups/askPopup.ejs'),
    previousReply: view('pages/popups/previousReply.ejs'),
    question: view('pages/popups/question.ejs'),
    widgetBatchCard: view('/components/answerCard.ejs'),
    comments: view('pages/userWidgetBatch/comments'),

    answeringPopup: _.extend({}, common, {
      main: view('pages/popups/answerQuestion/main'),
      playableAnswerSm: view('pages/popups/answerQuestion/playableAnswerSm'),
      feed: view('pages/popups/answerQuestion/feed')
    })
  }),

  userWidgetBatch: _.extend({},{
    feed: view('pages/userWidgetBatch/userWidgetBatch'),
    top : view('pages/userWidgetBatch/top'),
    bottom : view('pages/userWidgetBatch/bottom'),
    nav: view('pages/userWidgetBatch/nav'),
    modals: view('pages/userWidgetBatch/modals'),
    comments: view('pages/userWidgetBatch/comments'),
    widgetBatchCard: view('partials/common/widgetBatchCard'),
    main: view('pages/userWidgetBatch/main'),
    panel: view('pages/userWidgetBatch/panel')
  }),

  googleVerification: {
    main: view('pages/googleVerification/googleVerification')
  },
  
  tensports: _.extend({}, common, {
    leftPane: view('partials/tensports/leftPane'),
    openQuestion: view('partials/tensports/openQuestion'),
    panel: view('partials/tensports/panel'),
    rightPane: view('partials/tensports/rightPane'),
    answerQuestion: view('pages/popups/answerQuestion'),
    playableAnswerSm: view('partials/tensports/playableAnswerSm')
  }),

  yogaday: _.extend({}, campaigns, {
    panel: view('/campaigns/pages/campaign/panel')
  }),

  ambassador: {
    main: view('/campaigns/pages/ambassador/panel')
  },

  productmanager: {
    main: view('/campaigns/pages/productmanager/panel')
  }
};
