var view = require('view').prefix('widgets');
var _ = require('lodash');

var common = {
  main: view('common/main'),
  top: view('common/top'),
  bottom: view('common/bottom'),
  nav: view('common/nav'),
  auth: view('/components/auth'),
  answerCard: view('/components/answerCard'),
  openAnswerCard: view('/components/openAnswerCard'),
  comments:view('/components/common/comments'),
  questionCard:view('/components/questionCard'),
  fbMeta:view('/site/partials/meta/facebook')

};

var newsite = {
  main: view('/newsite/common/main'),
  top: view('/newsite/common/top'),
  bottom: view('/newsite/common/bottom'),
  nav: view('/newsite/common/nav'),
  pushNotification: view('/newsite/common/PushNotifications'),
  comments:view('/components/common/comments'),
  answerCard:view('/components/answerCard0'),
  userCard :view('/components/userCard'),
  singleUserCard :view('/components/singleUserCard'),
  questionCard:view('/components/questionCard'),
  auth: view('/components/auth'),
  feed : view('/newsite/common/feed'),
  feedColumn : view('/newsite/common/feedColumn'),
  openQuestionCard: view('/components/openQuestion')

};

var partials = module.exports = {
  common: common,

  userWidgetBatch: _.extend({}, common, {
    panel: view('pages/userWidgetBatch/panel'),
    header: view('pages/userWidgetBatch/header'),
    feed: view('pages/userWidgetBatch/feed')
  }),

  userWidgetSmall: _.extend({}, common, {
    panel: view('pages/userWidgetSmall/panel')
  }),

  userWidgetLarge: _.extend({}, common, {
    panel : view('pages/userWidgetLarge/panel')
  }),

  askButtonLarge : _.extend({}, common, {
    panel : view('pages/askButtonLarge/panel')
  }),

  askButtonSmall : _.extend({}, common, {
    panel : view('pages/askButtonSmall/panel')
  }),

  openQuestionWidget : _.extend({}, common, {
    openQuestionCard: view('/components/openQuestion'),
    panel : view('pages/openQuestionWidget/panel'),
  }),

  openQuestionPage : _.extend({}, common, {
    panel : view('pages/openQuestionPage/panel'),
    feed: view('pages/openQuestionPage/feed')
  }),

  me : _.extend({}, common, {
    panel : view('pages/me/panel'),
  }),

  profile: _.extend({}, newsite, {
    panel: view('/newsite/pages/profile/panel'),
    header: view('/components/profileHeader'),
    feed: view('/newsite/pages/profile/feed'),
    feedPanel: view('/newsite/pages/profile/feedPanel'),
    userBio: view('/newsite/pages/profile/userBio'),
    askQuestion: view('/newsite/pages/profile/askQuestion'),
    profileall: view('/newsite/pages/profile/profileallpanel'),
    feedColumn : view('/newsite/pages/profile/feedColumn'),
  }),

  openQuestion : _.extend({}, common, {
    panel : view('pages/openQuestion/panel'),
    feed: view('pages/openQuestion/feed')
  }),

  videoComment : _.extend({}, common, {
    panel : view('pages/videoComment/panel')
  }),

  viewVideoComment : _.extend({}, common, {
    panel : view('pages/viewVideoComment/panel'),
    videoCommentCard : view('pages/viewVideoComment/videoCommentCard')
  }),
    post : _.extend({}, common, {
    panel: view('pages/post/panel'),
    feed: view('pages/post/feed')
  }),



 /* askPopup :  {
    main : view('popups/askPopup/panel')
  },
*/
  askPopup : _.extend({}, common, {
    panel : view('popups/askPopup/panel'),
    question : view('popups/askPopup/question'),
    userCard : view('popups/askPopup/userCard')
  }),

  modals : _.extend({}, common, {
  }),

  answerPopup : _.extend({}, common, {
    answerCard: view('/components/answerCard'),
    panel: view('popups/answerPopup/panel')
  }),

  questionCard : _.extend({}, common, {
    question : view('popups/askPopup/question'),
    panel: view('pages/questionCard/panel'),
    auditionQuestions: view('popups/auditionPopup/auditionQuestions')
  }),


  widgetAudition : _.extend({}, common, {
    panel: view('pages/widgetAudition/panel')
  }),

  auditionPopup : _.extend({}, common, {
    panel: view('popups/auditionPopup/panel'),
    form: view('popups/auditionPopup/auditionForm')
  }),

/*  auditionPopupQuestions : _.extend({}, common, {
    panel: view('popups/auditionPopup/auditionQuestions')
  })*/

};
