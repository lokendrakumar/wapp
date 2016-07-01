app.components.videoCommentHolder = function ($panel) {
  var $loadMoreBtn = $panel.find('.load-more-btn') || 'www.test.com';
  var sourceUrl = $panel.data('url');
  var $commentCard = $panel.find('.commentCard');
  var $loadLessBtn = $panel.find('.load-less-btn');
  var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
  if (isSafari) {
    $panel.hide();
  }

  $loadMoreBtn.on('click', function (ev) {
    console.log(sourceUrl);
    var targetUrl = '/widgets/viewComment?url=' + sourceUrl ;
    var $offset = $panel.find('.checkLimit');
    var offset = $offset.attr('data-offset');

    $commentCard.css({'width' : $commentCard.width()  * 1.1});
    window.scrollBy(500, 0);

     if (offset == -1) {
      //$loadMoreBtn.hide();
      //Materialize.toast('no more comments to load !', 4000, 'red lighten-2')
    } else {
      app.utils.ajax.get(targetUrl, {
      data: {
        offset: offset,
        }
      }).then(
      function (data) {
        var div = document.createElement('div');
        var $div = $(div);
        $div.html(data);
        $panel.find('ul#video').append($div.find('ul#video').html());
        $offset.attr('data-offset', $div.find('.checkLimit').attr('data-offset'));
      });
    };
  });
  $loadLessBtn.on('click', function (ev) {
    window.scrollBy(-500, 0);
  });
}
