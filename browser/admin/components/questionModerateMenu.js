app.components.questionModerateMenu = function ($navbar) {
  var pageUrl = app.utils.currentUrl(true);
  var $public = $navbar.find('.public');
  var $celeb = $navbar.find('.celeb');
  var $table = $navbar.find('.tablediv');
  var $checkbox = $navbar.find('.checkboxFlag');
  var doc =[];
  $checkbox.attr('disabled', true);

  var ajaxGet = function (getData) {
    app.utils.ajax.get(pageUrl, getData).then( function (data) {
      $table.append(data.feed);
      app.utils.reloadBottomOnly();

    });
  };

  var getModerateQuestion = function (param) {
    var getData = { data: { param: param, partials: ['feed'] }};
    if (param === 3){
      doc['public'] = $table.html();
      if ($.trim(doc['celeb']) === '') {
        $table.empty();
        ajaxGet(getData);
      } else {
        $table.empty();
        if ($checkbox.is(':checked')) {
          $table.append(doc['celebflag']);
          app.utils.reloadBottomOnly();
      } else {
          $table.append(doc['celeb']);
          app.utils.reloadBottomOnly();
        }
      }      
    } else {
      if ($checkbox.is(':checked')) {
        doc['celebflag'] = $table.html();
        app.utils.reloadBottomOnly();
      } else {
        doc['celeb'] = $table.html();
        app.utils.reloadBottomOnly();
      }
      $checkbox.attr('disabled', true);
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

  var getFlaggedQuestion = function (param) {
    var getData = { data: { param: param, partials: ['feed'] }};
    if (param === 0){
      doc['celeb'] = $table.html();
      if ($.trim(doc['celebflag']) === '') {
        $table.empty();
        ajaxGet(getData);
        doc['celebflag'] = $table.html();
      } else {
        $table.empty();
        $table.append(doc['celebflag']);
      }
    } else {
      $table.empty();
      $table.append(doc['celebflag']);
    }      
  };

  $checkbox.on('change', function () {
    if ($(this).is(':checked')) {
      var param = 0;
      getFlaggedQuestion(param);
    } else {
      doc['celebflag'] = $table.html();
      $table.empty();
      $table.append(doc['celeb']);
      app.utils.reloadBottomOnly();
    }
  });

  $public.on('click', function (){
    event.preventDefault();
    if (!$public.hasClass('active')) {
      $celeb.removeClass('active');
      $public.addClass('active');
      getModerateQuestion(null);
    }
  });

  $celeb.on('click', function (){
    event.preventDefault();
    $checkbox.removeAttr('disabled');
    if (!$celeb.hasClass('active')) {
      $celeb.addClass('active');
      $public.removeClass('active');
      getModerateQuestion(3);
    }
  });
}
