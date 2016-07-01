app.components.profileHeader = function ($card) {
	 var $video = $card.find('.introVideo');
  var $videoHolder = $video.parent();
  var $introVideoImage = $video.parent().find('img.userImg');
  var $followContainer = $card.find('.follow-container');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $video.fadeIn('slow');
    app.behaviors.video($video);
    $video.trigger('click');
  });

  var $followBtn = $card.find('.followBtn');
  var $followersCount = $card.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followersCount);
};
  