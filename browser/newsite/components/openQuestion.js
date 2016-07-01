app.components.openQuestion = function ($card) {

  var $introVideo = $card.find('.introVideo');
  var $answerVideo = $card.find('.answerVideo');
  var $viewAll = $card.find('.viewAll');
  var $questionCardContent = $card.find('.question-card-content');
  var $recorder = $card.find('.popupRecorder');
  app.behaviors.video($introVideo);
  var w = 700;
  var h = 600;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  $('body').attr('class', '');

  $answerVideo.on('click', function (ev){
    window.open($(this).data('url'), '', 'width=' + 320 + ',height=' + 530 + ',top=' + top + ',left=' + left);
  });
    
  $viewAll.on('click', function (ev){
    window.open($(this).data('url'));
  });

  $recorder.on('click', function (ev){
    window.open($(this).data('url'), '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
  });

  /*
   * Share question on fb/twt/g+
   */
  var $fbShare = $card.find(".facebook-icon");
  var $twtShare = $card.find(".twitter-icon");
  var $gglShare = $card.find(".google-icon");
  var shareUrl = $questionCardContent.attr('data-url');
   
  
  $fbShare.on('click', function () {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

  $twtShare.on('click', function () {
    var shareText = $twtShare.attr('data-text');
    window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl, 'twitter', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

  $gglShare.on('click', function () {
    window.open('https://plus.google.com/share?url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

};