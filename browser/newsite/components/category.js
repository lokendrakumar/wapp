app.components.category = function($category) {

  $customCategory = $category.find('.custom-category');
  $appendTo =   $category.find('.append-feed');
  $dropDown =  $category.find('.dropdown-selected');
  $categoryList =$category.find('.category-group-list');
  var category_Url = document.URL;
  $customCategory.on('click', function(){

    var $franksters = $category.find('.franksters');
    var $activity = $category.find('.activity');
    app.categoryFilter = $(this).data('filter-id');
    //console.log('here',app.categoryFilter);
    if(app.categoryFilter === 'franksters') {
      $franksters.css('display','block');
      $activity.css('display','none');

    }
    else if(app.categoryFilter === 'activity'){

      if(!app.repeatActivityCall) {
        $franksters.css('display','none');
        app.repeatActivityCall = true;
        $appendTo.prepend(app.utils.preloaderHtml());
        $appendTo.show();
        app.utils.ajax.get(category_Url, {
        data: {
            category_Name: app.categoryFilter,
            partials :['feed']
          }
          }).then(function (data) {
           $category.find('.text-center').hide();
          $appendTo.append(data.feed);
          $franksters.css('display','none');
          $activity.css('display','block');
    
        });       
      }
      else if(app.repeatActivityCall){

        $franksters.css('display','none');
        $activity.css('display','block');

      }
    }
  })
  var isListShown = false;
  $dropDown.on('click', function(){

    if(!isListShown) {
      $categoryList.css('display','block');
      isListShown =true;
    }
    else {
      $categoryList.css('display','none');
      isListShown =false;
    }

  })

}