app.components.questionCard = function ($card) {

  /**
   * request answer functionality
   */
  var $requestBtn = $card.find('.requestBtn');
  var $spanYou = $card.find('.spanYou');
  var $spanUpvotes = $card.find('.spanUpvotes');
  var $upvoteText = $card.find('.upvoteText');
  var upvotes = parseInt($spanUpvotes.html());
  var isShare = !($requestBtn.data('share') === undefined);
  app.behaviors.requestAnswer($requestBtn, isShare, $spanYou); 


  if(upvotes <= 0) {
    $upvoteText.hide();
  } else {
    $upvoteText.show();
  }

  /**
   * share functionality
   */
  var shareSelector = '#icon-share-'+$card.attr('id');
  var $shareIcon = $card.find(shareSelector);
  app.behaviors.shareBtn(shareSelector, $shareIcon);

  /**
    * Report User Functionality
    */
  var $reportButton = $card.find('.report-user');
  app.behaviors.report($reportButton);

  
};

