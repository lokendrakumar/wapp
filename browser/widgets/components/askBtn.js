app.components.askBtn = function ($card) {

  var $askBtn = $card.find('.askBtn');
  var url = $askBtn.data('url');
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  $askBtn.on('click', function (ev) {
    window.open(url, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $('body').css('overflow', 'hidden');
  $('body').attr('class', '');
};