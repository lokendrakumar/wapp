app.components.stdFeedNew = function ($feedHolder) {

  var $feedEnd = $feedHolder.find('.feed-end');
  var working = false;
  var done = false;

  var loadMore = function () {
    var categoryName = $feedHolder.data('category-id');
    if (! working && ! done) {
      working = true;
      $feedEnd.html(app.utils.preloaderHtml());
      var postIndex = parseInt($feedEnd.data('post-index'));
      var userPostIndex = parseInt($feedEnd.data('userpost-index'));
      var categoryIndex = parseInt($feedEnd.data('category-index'));

      categoryIndex = isNaN(categoryIndex) ? 0:categoryIndex;
      var pageUrl = app.utils.currentUrl(true);
      if (postIndex>=0){
      app.utils.ajax.get(pageUrl, {
          data: {
            postIndex: isNaN(postIndex) ? 0 : postIndex,
            userPostIndex:isNaN(userPostIndex) ? 0 : userPostIndex,
            categoryIndex:isNaN(categoryIndex) ? 0:categoryIndex,
            partials: ['feed'],
            category_Name: categoryName,
          }
        })
        .then(function (partials) {
          // extracting feedDiv without using jquery
          // so that script tags remain intact
          var el = document.createElement('div');

          el.innerHTML = partials.feed;

          var $feedDiv = $(el).find('.feed');
          var $elFeedEnd = $(el).find('.feed-end');
          if ($feedDiv[0].childElementCount > 0) {
            $feedHolder.find('.column1').append($(el).find('.column1').html());
            $feedHolder.find('.column2').append($(el).find('.column2').html());
            $feedHolder.find('.column3').append($(el).find('.column3').html());
            $feedHolder.find('.column4').append($(el).find('.column4').html());
            // $feedHolder.find('.feed').append($feedDiv.html());
            $feedEnd.data('post-index', $elFeedEnd.data('post-index'));
            $feedEnd.data('userpost-index', $elFeedEnd.data('userpost-index'));
            $feedEnd.data('category-index', $elFeedEnd.data('category-index'));
          } else {
            $feedEnd.replaceWith('');
            done = true;
          }
          working = false;

        }, function (res) {
          console.log(res);
        });
      }
      else{
        $feedEnd.replaceWith('');
        done = true;
      }
    }
  };

  var scrollListener = function () {
    if (app.utils.$elInViewport($feedEnd) && ! done && ! working) {
      loadMore();
    }
  };

  app.$window.on('scroll', scrollListener);

  var domNodeRemovalListener = function (ev) {
    if (app.utils.$elRemoved(ev, $feedHolder)) {
      app.$window.off('scroll', scrollListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);

  // call a load more as soon as feed gets rendered
  //loadMore();

};
