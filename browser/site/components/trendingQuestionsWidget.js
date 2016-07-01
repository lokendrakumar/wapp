app.components.trendingQuestionsWidget = function ($widget) {
  var $feed = $widget.find('.feed');
  var retrievalTimer = null;
  var retrievalInterval = 10000;
  var pageNum = function () { return parseInt($widget.data('page')); };
  var Category =  function () { return ($widget.data('category'))}; 
  var selectedCategory = Category();  
  var done = false;
  
  var retrieve = function () {
    if (! done) {
      app.utils.ajax.get('/trending-questions', {data: {page: pageNum(), category: selectedCategory} })
        .then(function (html) {
          if (html.length > 0) {
            $feed.fadeOut(400, function () {
              $feed.html(html);
              $widget.data('page', pageNum() + 1);
              $feed.fadeIn(400);
            });
          } else {
            done = true;
          }
        });
    }    
  };

  retrieve();

  retrievalTimer = setInterval(retrieve, retrievalInterval);
  
  var domNodeRemovalFunction = function (ev) {
    if (app.utils.$elRemoved(ev, $widget)) {
      clearTimeout(retrievalTimer);
      app.$document.off('DOMNodeRemoved', domNodeRemovalFunction);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalFunction);
  
};