app.components.discover = function($discover) {

  var $category = $discover.find('.custom-category');
  var $appendList = $discover.find('.feed-holder');

  if(app.$body.data('from')){

     app.utils.redirect(app.$body.data('from')+'/'+app.$body.data('username')+'/auth/'+app.$body.data('tok'));
     return;
  }
  $category.on('click',function() {
    var $featured = $discover.find('.featured');
    var $trending = $discover.find('.trending');

    app.categoryName = $(this).data('id');

    if(app.categoryName == 'featured'){
      $trending.css('display','none');
      $featured.css('display','block');
    }
    else if(app.isTrendingData && app.repeatCall){

      if(app.categoryName === 'trending' && app.isTrendingData === false){
        //do noting stop repeated data call
      }
      else{
        $featured.css('display','none');
        app.repeatCall = false;
        $appendList.prepend(app.utils.preloaderHtml());
        $appendList.show();
        //$('.trending').prop('disabled',true);
        //$trending.prop('disabled', true);
        app.utils.ajax.get('/discover', {
          data: {
            category_Name: app.categoryName,
            partials :['feed']
          }
          }).then(function (data) {
            $discover.find('.text-center').hide();
            $appendList.append(data.feed);
            if(app.categoryName == 'trending'){
              app.isTrendingData = false;
              $featured.css('display','none');
              $trending.css('display','block');
            }
           // $appendList.fadeIn(200);
           // $trending.prop('disabled', false);
           app.repeatCall = true;
        });
      }
    }
    else if(app.categoryName == 'trending'){
      $featured.css('display','none');
      $trending.css('display','block');
    }
  })

}
