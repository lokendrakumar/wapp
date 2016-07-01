app.components.widgetAudition = function ($card) {

  var $auditionBtn = $card.find('.giveAuditionBtn');
  var url = $auditionBtn.data('url');
  var w = 570;
  var h = 380;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  $auditionBtn.on('click', function (ev) {
    ev.preventDefault();
    window.open(url, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $('body').attr('class', '');
};