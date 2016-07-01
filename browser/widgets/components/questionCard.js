
app.components.questionCard = function($questionCard) {

  var $introVideo = $questionCard.find('.qustionCardIntroVideo');
  var $videoHolder = $introVideo.parent();
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $recorder = $questionCard.find('.recordBtn');

  var w = 700;
  var h = 600;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  
  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.fadeIn('slow');
    $introVideo.trigger('click');
    $introVideo.trigger('play');
    app.behaviors.video($introVideo);
  });

  $recorder.on('click', function (ev){
    window.open($(this).data('target'), '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
  });
   /**
   * request answer functionality
   */
  var $requestBtn = $questionCard.find('.requestBtn');
  var isShare = !($requestBtn.data('share') === undefined);

  app.behaviors.requestAnswer($requestBtn, isShare);


  var $reportButton = $questionCard.find('.report-user');
  app.behaviors.report($reportButton);



}
