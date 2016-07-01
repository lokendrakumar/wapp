app.components.surveyVideoAnswers = function ($answerVideoCard) {

  var $overlay = $answerVideoCard.find('.overlay');
  var $overlayPlayIcon = $answerVideoCard.find('.overlay-play-icon')
  var $video = $answerVideoCard.find('video');
  var currentOpacity = $overlay.css('opacity');

  $overlayPlayIcon.on('click', function (ev) {
    ev.preventDefault();
    $overlay.fadeTo(400,0, function () {
      $overlay.css({display: 'none'});
    });
    $video[0].play();
  });

  $video.on('click pause', function (ev) {
    ev.preventDefault();
    $video[0].pause();
    $overlay.css({display: 'block'});
    $overlay.fadeTo(400, currentOpacity);
  });

}