app.components.askUserWidgetLarge = function ($card) {

  var $askBtn = $card.find('.askBtn');
  var $introVideo = $card.find('.introVideo');
  var $videoHolder = $introVideo.parent();
  var url = $askBtn.data('url');
  //app.behaviors.video($introVideo);
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  var $introVideoImage = $introVideo.parent().find('img.userImg');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $askBtn.on('click', function (ev) {
    window.open(url, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $('body').attr('class', '');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.hide();
    $introVideo.show();
    app.behaviors.video($introVideo);
    $introVideo.trigger('click');
  });
};
