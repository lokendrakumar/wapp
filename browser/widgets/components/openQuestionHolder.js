app.components.openQuestionHolder = function ($feedHolder) {
  var $loadMoreBtn = $feedHolder.find('.load-more-btn');
  var $feedEnd = $feedHolder.find('.feed-end');
  var $loadLessBtn = $feedHolder.find('.load-less-btn');
  var $feed = $feedHolder.find('.feed');
  var offset = $feedEnd.attr('data-post-index');

   $loadMoreBtn.on('click', function (ev) { 
    var pageUrl = app.utils.currentUrl(true);
    $feed.css({'width' : $feed.width()  * 1.1});
    window.scrollBy(500, 0);
    if (offset == -1) {
      //$loadMoreBtn.hide();
      //Materialize.toast('no more comments to load !', 4000, 'red lighten-2')
    } else {
      app.utils.ajax.get(pageUrl, {
          data: {
            offset: offset
          }
        }).then(
        function (data) {
          var div = document.createElement('div');
          var $div = $(div);
          $div.html(data);
          $feedHolder.find('ul#video').append($div.find('ul#video').html());
          $feedEnd.attr('data-post-index', $div.find('.feed-end').attr('data-post-index'));
        });
      };
    });
   $loadLessBtn.on('click', function (ev) {
    window.scrollBy(-500, 0);
  });
};