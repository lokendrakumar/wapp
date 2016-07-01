app.components.answerCardLg = function ($card) {

  var $overlay = $card.find('.overlay');
  var $playIcon = $overlay.find('.icon-play');
  var $cardMeta = $card.find('.card-meta');
  var $panelHeader = $card.find('.panel-header');
  var $comments = $card.find('.comments');
  var $userIcon = $card.find('.icon-user');
  var $video = $card.find('video');
  var $userMeta = $card.find('.meta');
  var isPlaying = false;
  var _isViewed = false;
  

  /**
   * Set vertical alignment of the asked question on card
   */
  var $questionPlay = $card.find('.question-play');
  var margin = $questionPlay.parent().height() - ($questionPlay.height() + 100);
  margin = margin > 0 ? margin/2 : 0;
  $questionPlay.attr('style', 'margin-top : ' + margin + 'px');

  /**
   * Set vertical alignment of the asked question on card
   */
  var $embedBtn = $card.find('.embedBtn');
  $embedBtn.on('click', function (ev) {
    ev.preventDefault();
    var $embedModal = $('#embedModal');
    $embedModal.html($card.find('div.embedTmpl').html());
    app.utils.loadModal($embedModal);
  });

  /**
   * video play pause functionality
   */
  var videoPlaying = function () {
    $cardMeta.fadeTo('slow', 0.3);
    $panelHeader.fadeTo('slow', 0.3);
    $comments.fadeOut();
    $cardMeta.on('mouseenter', function () { $cardMeta.fadeTo('slow', 1); });
    $cardMeta.on('mouseleave', function () { $cardMeta.fadeTo('slow', 0.3); });
  };

  var videoNotPlaying = function () {
    $cardMeta.fadeTo('slow', 1);
    $panelHeader.fadeTo('slow', 1);
    $comments.delay(100).fadeIn();
    $cardMeta.off('mouseenter');
    $cardMeta.off('mouseleave');
  };

  $video.on('play', videoPlaying);
  $video.on('pause ended', function(ev){
    videoNotPlaying();
    if (ev.type === 'ended') {
      $video[0].currentTime = 0;
    }
  });
  app.behaviors.video($video, $card);

  $playIcon.on('click', function () {
    $overlay.fadeOut();
    $video.trigger('play');
  });

  $userMeta.hover(function(){
    $userIcon.addClass('scolor2').removeClass('scolor3');
    }, function(){
    $userIcon.addClass('scolor3').removeClass('scolor2');
  });

  /**
   * comments functionality
   */
  app.behaviors.commentBtn($comments);

  /**
   * like button functionality
   */
  var $likeBtnTrg = $card.find('.likeBtnTrg');
  var $likeBtn = $card.find('.likeBtn');
  app.behaviors.likeBtn($likeBtnTrg, $likeBtn);

  /**
   * share button functionality
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