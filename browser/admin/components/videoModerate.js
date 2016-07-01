app.components.videoModerate = function ($tbody) {

  var $moderation = $tbody.find('.approveVideo');

  $moderation.on('click', function() {

    var $tr = $(this).closest('tr');
    var answer_id  = $(this).data('id');
    var moderation_type = $(this).data('type');
    
    app.utils.ajax.post('/moderate/video/CRUD', {
      data: {
        answer_id: answer_id,
        moderation_type: moderation_type
          }
        }).then(function (data){
        if (data.success){
          $tr.css('display', 'none');
        }
    });
  });

  var ajaxcall = true;
  $(window).bind('scroll', function () {

    var $tableNextIndex = $tbody.find('.table-nextindex');
    var nextIndex = $tableNextIndex.data('next-index');
      if (document.body.scrollHeight ==  document.body.scrollTop + window.innerHeight && ajaxcall && nextIndex >=0) {
        ajaxcall = false;
        app.utils.ajax.get('/moderate/video', {
          data: {
            postIndex: nextIndex,
            partials: ['feed']
          }
        }).then(function (data) {
          $tableNextIndex.remove();
          $tbody.append(data.feed);
          ajaxcall = true;
        });
      }
  });


}