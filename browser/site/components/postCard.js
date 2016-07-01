app.components.postCard = function ($card) {

  /*
   * Find overlays
   */
  var $initOverlay = $card.find('[data-init-overlay]');
  var $actionOverlay = $card.find('[data-action-overlay]');
  
  var $video = $card.find('video');
  app.behaviors.video($video);

  /*
   * Additional Video Behaviors
   */
  $video.on('pause ended', function () {
    $actionOverlay.delay('slow').fadeIn('slow');
  });

  $video.on('play', function () {
    $initOverlay.fadeOut();
    $actionOverlay.fadeOut();
  });

  $initOverlay.on('click', function () {
    $video.trigger('click');
  });

  $actionOverlay.on('click', function () {
    $video.trigger('click');
  });

  /*
   * Attach comment behavior
   */
  var $showCommentBtn = $card.find('[data-comments-show]');
  var $hideCommentBtn = $card.find('[data-comments-hide]');
  var $commentHolder = $card.find('[data-action-overlay-comments]');
  var $questionHolder = $card.find('[data-action-overlay-question]');

  $showCommentBtn.on('click', function (ev) {
    ev.stopPropagation();
    $commentHolder.slideDown();
    $questionHolder.fadeOut();
  });

  $hideCommentBtn.on('click', function (ev) {
    ev.stopPropagation();
    $commentHolder.slideUp();
    $questionHolder.fadeIn();
  });

  app.behaviors.commentBtn($commentHolder);

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
  var $shareHolder = $card.find(shareSelector);
  app.behaviors.shareBtn(shareSelector, $shareHolder);
  $shareHolder.css('height', '35px');
  var $shareIcon = $shareHolder.find('i.icon-share');
  $shareIcon.addClass('scolor3');

  /*
   * Prevent event bubbling on specific click events
   */
  $card.find('a').on('click', function (ev) {
    ev.stopPropagation();
  });
  $commentHolder.on('click', function(ev) {
    ev.stopPropagation();
  });
  $likeBtn.on('click', function (ev) {
    ev.stopPropagation();
  });
  $likeBtnTrg.on('click', function (ev) {
    ev.stopPropagation();
  });
  $shareHolder.on('click', function (ev) {
    ev.stopPropagation();
  });

}