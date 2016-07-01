app.components.answerCardSm = function ($card) {

  
  var $overlay = $card.find('div.dvImgOverlay');
  var $videoHolder = $card.find('.dvHolder');
  var $videoImage = $videoHolder.find('img');
  var $icon = $card.find('.icon-vid');
  var $video = $videoHolder.find('video');
  var videoSrc = $video.attr('src');
  var $playIcon = $card.find('.icon-play');

  $playIcon.on('click', function () {
    var modalId = $playIcon.data('modal-id');
    var modalUrl = $playIcon.data('modal-url');
    
    app.utils.loadModal('#'+modalId, modalUrl);
  });

  /**
   * Set vertical alignment of the asked question on card
   */
  var $questionPlay = $card.find('.question-play');
  var margin = $questionPlay.parent().height() - ($questionPlay.height() + 50);
  margin = margin > 0 ? margin/2 : 0;
  $questionPlay.attr('style', 'margin-top : ' + margin + 'px');

  // imagesLoaded($videoImage[0], function( instance ) {       
  //   var top = parseInt($overlay.width())/2;
  //   var width = $videoHolder.width();
  //   $icon.attr("style", "top:"+(top - 20)+"px; left:"+top+"px;");
  //   $videoHolder.css("height", width);
  // });

  // $overlay.on('click', function () {
  //   if (videoSrc) {
  //     $overlay.fadeOut();
  //     $video.fadeIn();
  //     $video.trigger('click');
  //   } else {
  //     app.utils.notify('Sorry! The video you requested is not available.', 'error', 5);
  //   }
  // });

  // $video.on('pause ended', function (ev) {
  //   $overlay.fadeIn();
  //   $video.fadeOut();
  // });

  // app.behaviors.video($video);
};