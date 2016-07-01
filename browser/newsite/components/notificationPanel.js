app.components.notificationPanel = function ($id){

  var $taball = $id.find('.tab-all');
  var $tabnews = $id.find('.tab-post');
  var $feedEnd = $id.find('.feed-end');
  var $divall = $id.find('.my-tab-content');

  var NotificationPartial = function (param){
    var pageUrl = app.utils.currentUrl(true);
    var userIndex = parseInt($feedEnd.data('post-index'));
    var newsIndex = parseInt($feedEnd.data('news-index'));
    userIndex = isNaN(userIndex) ? 0 : userIndex;
    newsIndex = isNaN(newsIndex) ? 0 : newsIndex;

  app.utils.ajax.get(pageUrl, {
      data: {
        userIndex: userIndex, 
        partials: ['feed'],
        feedParam: param,
        nextindex: userIndex,
        newsindex: newsIndex
      }
    })
    .then(function (partials) {
      $divall.empty();
      $divall.append(partials.feed);
      $divall.css('display','block');
    });
  }



  $taball.on('click', function(){
    $taball.addClass('current');
    $tabnews.removeClass('current');
    NotificationPartial('me');
  });

  $tabnews.on('click', function (){
    $taball.removeClass('current');
    $tabnews.addClass('current');
    NotificationPartial('news');
  });


}