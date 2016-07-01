var view = require('view').prefix('admin');
var _ = require('lodash');

var common = {
  main: view('common/main'),
  top: view('common/top'),
  bottom: view('common/bottom'),
  nav: view('common/nav'),
  questioncardTable: view('components/questioncardTable'),
  commentsTable: view('components/commentsTable'),
  videosTable: view('components/videosTable'),
  answerTable: view('components/openQuestionAnswer'),
  openQuestionTable: view('components/openQuestionTable')
};

var partials = module.exports = {
  common: common,
  question: _.extend({}, common, {
    panel: view('pages/question/panel'),
    feed: view('pages/question/feed')
  }),
  openQuestion: _.extend({}, common, {
    panel: view('pages/openQuestionAnswer/panel'),
    feed: view('pages/openQuestionAnswer/feed'),
    answer: view('pages/openQuestionAnswer/answer')
  }),
  comments: _.extend({}, common, {
    panel: view('pages/comments/panel'),
    feed: view('pages/comments/feed')

  }),
  videos: _.extend({}, common, {
     panel: view('pages/video/panel'),
     feed: view('pages/video/feed'),
     feedHolder: view('pages/video/feedHolder')

  }),
  karaoke: _.extend({}, common, {
    panel: view('pages/karaoke/panel'),
    searchwrap: view('pages/karaoke/searchwrap'),
    allcategory: view('pages/karaoke/allcategory'),
    selectedcatsongs: view('pages/karaoke/selectedcatsongs'),
		searchresults: view('pages/karaoke/searchresults'),
  }),

  dubsmash: _.extend({}, common, {
    panel: view('pages/dubsmash/panel'),
    searchwrap: view('pages/dubsmash/searchwrap'),
    allcategory: view('pages/dubsmash/allcategory'),
    selectedcatsongs: view('pages/dubsmash/selectedcatsongs'),
    searchresults: view('pages/dubsmash/searchresults')
  }),

  login: _.extend({}, common, {
     panel: view('pages/login/panel')
  }),
};
