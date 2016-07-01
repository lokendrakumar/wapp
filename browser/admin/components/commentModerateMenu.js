app.components.commentModerateMenu = function ($navbar) {
  var pageUrl = app.utils.currentUrl(true);
  var $publicComment = $navbar.find('.public');
  var $dirtyComment = $navbar.find('.dirty');
  var $table = $navbar.find('.tablediv');
  var doc =[];

  var ajaxGet = function (getData) {
    app.utils.ajax.get(pageUrl, getData).then( function (data) {
      $table.append(data.feed);
      app.utils.reloadBottomOnly();
    });
  };

  var getModerateComment = function (param) {
    var getData = { data: { param: param, partials: ['feed'] }};
    if (param == 'dirty'){
      doc['public'] = $table.html();
      if ($.trim(doc['dirty']) === '') {
        console.log('here');
        $table.empty();
        ajaxGet(getData);
      } else {
        $table.empty();
        $table.append(doc['dirty']);
        app.utils.reloadBottomOnly();

      }      
    } else {
      doc['dirty'] = $table.html();
      if ($.trim(doc['public']) === '') {
        $table.empty();
        ajaxGet(getData);
      } else {
        $table.empty();
        $table.append(doc['public']);
        app.utils.reloadBottomOnly();
      }      
    }
  };
  $publicComment.on('click', function (ev){
    ev.preventDefault();
    if (!$publicComment.hasClass('active')) {
      $dirtyComment.removeClass('active');
      $publicComment.addClass('active');
      // doc['celeb'] = $table.html(); 
      getModerateComment('public');
    }
  });

  $dirtyComment.on('click', function (ev){
    ev.preventDefault();
    if (!$dirtyComment.hasClass('active')) {
      $dirtyComment.addClass('active');
      $publicComment.removeClass('active');
      // doc['public'] = $table.html(); 
      getModerateComment('dirty');
    }
  });
}
