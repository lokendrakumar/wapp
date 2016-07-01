app.components.askPopupQuestionCard = function ($container) {

  /**
   * request answer functionality
   */

  var $questionCard = $container.find('.question-card');
  var $requestBtn = $questionCard.find('.request-answer-btn');
  //var $spanYou = $container.find('.spanYou');
 // var $spanUpvotes = $container.find('.upvote-count');
  //var $upvoteText = $container.find('.upvoteText');
  //var upvotes = parseInt($spanUpvotes.html());
  var isShare = !($requestBtn.data('share') === undefined);
  app.behaviors.requestAnswer($requestBtn, isShare); 


 /* if(upvotes <= 0) {
    $upvoteText.hide();
  } else {
    $upvoteText.show();
  }*/

  /**
   * share functionality
   */
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  var $shareQuestion = $questionCard.find(".share-question");
  var shareUrl = $shareQuestion.data('url');
  var $fbShare = $shareQuestion.find(".share-fb");
  var $twtShare = $shareQuestion.find(".share-twt");
  var $gglShare = $shareQuestion.find(".share-ggl");

  $fbShare.on('click', function (ev) {
    ev.preventDefault();
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
  });

  $twtShare.on('click', function (ev) {
    ev.preventDefault();
    var shareText = $shareQuestion.data('text');
    window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
  });

  $gglShare.on('click', function (ev) {
    ev.preventDefault();
    window.open('https://plus.google.com/share?url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
  });

  /**
    * Report User Functionality
    */
  var $reportButton = $container.find('.report-user');
  //app.behaviors.report($reportButton);

  
};
