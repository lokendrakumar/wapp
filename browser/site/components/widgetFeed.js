app.components.widgetFeed = function ($feedHolder) {

  var $feedEnd = $feedHolder.find('.feed-end');
  var working = false;
  var done = false;
  console.log("hello");

  var loadMore = function () {
    if (! working && ! done) {
      working = true;

      $feedEnd.html(app.utils.preloaderHtml());

      var curPage = parseInt($feedEnd.data('page'));
      var nextPage = curPage + 1;
      var pageUrl = app.utils.currentUrl(true);

      app.utils.ajax.get(pageUrl, {
          data: {
            page: nextPage, partials: ['feed']
          }
        })
        .then(function (partials) {
          // extracting feedDiv without using jquery
          // so that script tags remain intact
          var el = document.createElement('div');
          el.innerHTML = partials.feed;
          var feedDiv = el.getElementsByClassName('feed')[0];

          if (feedDiv.childElementCount > 0) {
            $feedHolder.find('.feed').append(feedDiv.innerHTML);
            $feedEnd.data('page', nextPage);
          } else {
            done = true;
          }

          $feedEnd.html('');

          working = false;
        }, function (res) { console.log(res); });
    }
  };

  var scrollListener = function () {
    if (app.utils.$elInViewport($feedEnd) && ! done) {
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
//loadMore();

};