app.components.dubsmashCategory = function ($catName) {
  var $cat = $catName.find('.dubsmashCat');
  var $containingDiv = $catName.closest('.catDetailsDiv');
  var $togglePos = $catName.find('.toggle-pos');
  var $optWrap = $catName.find('.opt-wrap');
  var $reorderTB = $catName.find('.reorderTB');
  var $categoryAddwrap = $catName.find('.category-addwrap');

  var ajaxGetAudio = function (catId, category) {
    var data = {
      partials: ['selectedcatsongs'],
      catId: catId,
      category: category
    };
    app.utils.ajax.get('/dubsmash/Audio',{data: data}).then(function (data) {
      var $audioDiv = $containingDiv.find('.catAudio');
      $audioDiv.empty();
      $audioDiv.append(data.selectedcatsongs);
    });
  };

  $reorderTB.on('keypress', function (ev) {
    ev.stopPropagation();
    console.log('here', $(this).val());
    var key = ev.which;
    if(key == 13)
    {
      // console.log('here');
      var catId = $(this).closest('.catName').data('catid');
      var val = $(this).val();
      var next_id = $catName.find('.catNo'+(val-1)).data('catid');
      var prev_id = $catName.find('.catNo'+val).data('catid');
      var data = {
        catId: catId,
        prev_id: prev_id,
        next_id: next_id,
        type: 'category',
        feature: 'dubsmash'
      };
      console.log(data);
      app.utils.ajax.post('/reorder', {data: data}).then(function (data) {
        console.log(data);
      });
      return false;  
    }
  });

  $togglePos.on('click', function (ev) {
    ev.stopPropagation();
    var $curDiv = $(this).parent().find(".opt-wrap");
    var val = $curDiv.css("display");
    $optWrap.hide('slow');
    if (val === "none") {
      $curDiv.slideToggle();
    }
    return false;
  });

  $(".edit-cat").on('click', function (ev) {
    ev.stopPropagation();
    var $curCategoryWrap = $(this).closest('.catName').find(".category-addwrap");
    if ($curCategoryWrap.css('display') === 'none') {
      $categoryAddwrap.hide('slow');
      $curCategoryWrap.show('slow');
    } 
  });


  $cat.on('click', function (ev) {
    ev.preventDefault();
    var $categoryName = $(this).find('.dubsmashCat');
    $cat.removeClass('active');
    $(this).addClass('active');

    var $catDisplayName = $(this).find('.cat-Name');
    var catId = $(this).data('catid');
    ajaxGetAudio(catId, $catDisplayName.html());
  })
}