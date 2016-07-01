app.components.profileFeedHolder = function ($feedHolder) {

  var $feedEnd = $feedHolder.find('.feed-end');
  var working = false;
  var done = false;

  var loadMore = function () {
    if (! working && ! done) {
      app.FRANKLY.currentfeed = (app.FRANKLY.currentfeed === undefined || app.FRANKLY.currentfeed === '') ? 'All' : app.FRANKLY.currentfeed;
      working = true;
      $feedEnd.html(app.utils.preloaderHtml());
      var questionIndex = parseInt($feedEnd.data('question-index'));
      questionIndex = isNaN(questionIndex) ? 0 : questionIndex;
      var postIndex = parseInt($feedEnd.data('post-index'));
      postIndex = isNaN(postIndex) ? 0 : postIndex;
      var userIndex = parseInt($feedEnd.data('user-index'));
      userIndex = isNaN(userIndex) ? 0 : userIndex;
      var pageUrl = app.utils.currentUrl(true);
      var pageNum = 0;
      if(app.FRANKLY.currentfeed === 'All'){
        pageNum = userIndex;
      }
      else if(app.FRANKLY.currentfeed === 'post'){
        pageNum = postIndex;
      }
      else{
        pageNum = questionIndex;
      }
      if(pageNum>=0){
        app.utils.ajax.get(pageUrl, {
            data: {
              questionIndex: isNaN(questionIndex) ? 0 : questionIndex,
              postIndex: isNaN(postIndex) ? 0 : postIndex,
              userIndex: isNaN(userIndex) ? 0 : userIndex,
              partials: ['profileall'],
              feedParam: app.FRANKLY.currentfeed
            }
          })
          .then(function (partials) {
            // extracting feedDiv without using jquery
            // so that script tags remain intact
            var el = document.createElement('div');
            el.innerHTML = partials.profileall;
            var $feedDiv = $(el).find('.feed');
            var $elFeedEnd = $(el).find('.feed-end');

            if ($feedDiv[0].childElementCount > 0) {
              $feedHolder.find('.column1').append($feedDiv.find('.column1').html());
              $feedHolder.find('.column2').append($feedDiv.find('.column2').html());
              $feedEnd.data('question-index', $elFeedEnd.data('question-index'));
              $feedEnd.data('post-index', $elFeedEnd.data('post-index'));
              $feedEnd.data('user-index', $elFeedEnd.data('user-index'));
            } else {
              $feedEnd.replaceWith('');
              done = true;
            }
            app.FRANKLY.dataelem = (app.FRANKLY.dataelem === undefined) ? {} : app.FRANKLY.dataelem;
            app.FRANKLY.dataelem[app.FRANKLY.currentfeed] = $feedHolder.parent().html();
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
