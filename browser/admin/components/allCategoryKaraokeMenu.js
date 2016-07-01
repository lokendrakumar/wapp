app.components.allCategoryKaraokeMenu = function ($allCategory) {

  var $category = $allCategory.find('.catName');
  var $send = $allCategory.find('.sendCategory');
  var pageUrl = app.utils.currentUrl(true);
  var $songs = $allCategory.parent().parent().find('.songs');
  var $deleteCategory = $allCategory.find('.delete-category');
  var $updateCategory = $allCategory.find('.edit-category');
  var $image;

  $category.on('click', function (ev){
    var $categoryName = $(this).find('.category');
    $category.removeClass('active');
    $(this).addClass('active');
    var categoryDisplay = $categoryName.html();
    app.categoryId = $categoryName.data('id');
    var getData = { data: { id: app.categoryId, partials:['selectedcatsongs'], cat_name: categoryDisplay}};
    app.utils.ajax.get('/reorder/tracks', getData).then( function (data) {
      $songs.html('');
      $songs.html(data.selectedcatsongs);
      app.utils.reloadBottomOnly();
    });
  })

  $deleteCategory.on('click', function(ev){

    var categoryId = $(this).data('id');
    console.log(categoryId)
    var formdata = new FormData();
    formdata.append('categoryId', categoryId);
    app.utils.ajax.post('/karaoke/deleteCategory',{
        data:formdata,
        processData: false,
        contentType: false
    }).then(function (data) {
      //console.log(data)
      window.location.reload();
    });

  })

  var $categoryImage = $allCategory.find('.edit-categoryImage');
  $categoryImage.on('change', function (ev){
    $image = $(ev.currentTarget)[0].files[0];
  })
  
  $updateCategory.on('click', function (ev) {
    ev.stopPropagation();
    var categoryName = $allCategory.find('.edit-category-name');   
    var categoryTwitter = $allCategory.find('.edit-twitter-handle');
    var categoryLat = $allCategory.find('.latitude');
    var categoryLong = $allCategory.find('.longitude');
    var categoryRadius = $allCategory.find('.radius');
    var categoryTop = $allCategory.find('.edit-categoryTop').is(':checked') ? 1:0
    var categoryId = data('cat-id');
    console.log($image)
    if(!$image){
      $image = '';
    }

    var formdata = new FormData();
    formdata.append("categoryId", categoryId);
    formdata.append("icon_image", $image);
    formdata.append("display_name", categoryName.val());
    formdata.append("twitter_handle", categoryTwitter.val());
    formdata.append("lat", categoryLat.val());
    formdata.append("long", categoryLong.val());
    formdata.append("radius", $categoryRadius.val());
    formdata.append("show_on_top", categoryTop);

    app.utils.ajax.post('/karaoke/EditCategory', {
        data:formdata,
        processData: false,
        contentType: false
    }).then(function (data) {
      //console.log(data)
      window.location.reload();
    });
    
  });
}