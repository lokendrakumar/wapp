app.components.answerVideoModal = function ($modal) {
  /**
   * toggle question line functionality
   */
  var $toggleIcon = $modal.find('.toggleIcon');
  var $toggleQuestion = $modal.find('.toggleQuestion');
  $toggleIcon.on('click', function () {
    var state = $toggleIcon.data('state');
    var $toggleI = $toggleIcon.find('i');
    if (state === "close") {
      $toggleIcon.data('state', 'open');
      $toggleI.removeClass('icon-down');
      $toggleI.addClass('icon-up');
      $toggleQuestion.css('height', 'auto');
    } else if (state === "open") {
      $toggleIcon.data('state', 'close');
      $toggleI.removeClass('icon-up');
      $toggleI.addClass('icon-down');
      $toggleQuestion.css('height', '30px');
    }
  });

  /**
   * video modal functionality
   */
  var $cardMeta = $modal.find('.card-meta');
  var $video = $modal.find('video');
  var $comments = $modal.find('.comments');

  var videoPlaying = function () {
    $cardMeta.fadeTo('slow', 0.3);
    $comments.fadeOut();
    $cardMeta.on('mouseenter', function () { $cardMeta.fadeTo('slow', 1); });
    $cardMeta.on('mouseleave', function () { $cardMeta.fadeTo('slow', 0.3); });
  };

  var videoNotPlaying = function () {
    $cardMeta.fadeTo('slow', 1);
    $comments.fadeTo('slow', 1);
    $cardMeta.off('mouseenter');
    $cardMeta.off('mouseleave');
  };

  app.behaviors.video($video);

  $video.on('play', videoPlaying);
  $video.on('pause ended', videoNotPlaying);

  var autoPauseListener = function (ev, closedModal) {
    var $closedModal = $(closedModal);
    if ($closedModal.children('.answerVideo').length > 0 && $closedModal.children('.answerVideo')[0] === $modal[0]) {
      $video.trigger('pause');
      app.vent.off('modal.closed', autoPauseListener);
    }
  };

  app.vent.on('modal.closed', autoPauseListener);

  // play video automatically by default
  $video.trigger('play');

  /**
   * Set vertical alignment of the asked question on card
   */
  var $embedBtn = $modal.find('.embedBtn');
  $embedBtn.on('click', function (ev) {
    ev.preventDefault();
    var $embedModal = $('#embedModal');
    $embedModal.html($modal.find('div.embedTmpl').html());
    app.utils.loadModal($embedModal);
  });

  /**
   * comments functionality
   */
  app.behaviors.commentBtn($comments);

  /**
   * like button functionality
   */
  var $likeBtnTrg = $modal.find('.likeBtnTrg');
  var $likeBtn = $modal.find('.likeBtn');
  app.behaviors.likeBtn($likeBtnTrg, $likeBtn);

  /**
   * share button functionality
   */
  var shareSelector = '#icon-share-'+$modal.attr('id');
  var $shareIcon = $modal.find(shareSelector);
  app.behaviors.shareBtn(shareSelector, $shareIcon);

};