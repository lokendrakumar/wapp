app.components.videoComment = function ($panel) {

  var $commentBtn = $panel.find('.commentBtn');
  var sourceUrl = $commentBtn.data('url');
  var count = $panel.data('count');


  var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
  if (isSafari) {
    document.getElementsByClassName("videoComment")[0].style.display = "none";
  }

  if (count == 0) {
    var interval = setInterval(function () {
      location.reload();
      if(count == 1) {
        clearInterval(interval);
      }
    }, 5000);
  };

  var w = 300;
  var h = 500;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  $commentBtn.on('click', function (ev) {
    window.open(sourceUrl, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $('body').css('overflow', 'hidden');
  $('body').attr('class', '');
};
