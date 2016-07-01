app.components.categoryArea = function ($card) {


  if(app.$body.data('from')){
     app.utils.redirect(app.$body.data('from')+'/'+app.$body.data('username')+'/auth/'+app.$body.data('tok'));
     return;
  }

  var $playIcon = $card.find('.category');
    
  var attachFollowingBehavior = function () {
    var $categoryName = $card.find('.categoryName');
    
    $playIcon.hover(
      function(){
        var html = $(this).data('category');
        $categoryName.html('<i class="icon-star yc"></i> ' + html);
      },
      function(){
        $categoryName.html('<i class="icon-star yc"></i> Categories');
      }
    );
  };

  attachFollowingBehavior();

};