app.components.commentModerate = function ($tbody) {

  var $commentText = $tbody.find('.commentText');
  var $commentApprove = $tbody.find('.commentApprove');
  var $commentDelete = $tbody.find('.commentDelete');

  $commentText.on('click', function (){
    $(this).data('flag',true);
  });
  $commentApprove.on('click', function (){
    var $tr = $(this).closest('tr');
    var $commentText = $tr.find('.commentText');
    var data = {
      body: $commentText.html(),
      id: $commentText.data('comment'),
    }
    if($commentText.data('flag')){
      data.param = 'edit/approve'
      app.utils.ajax.post('/moderate/comment/CRUD', {data: data}).then(function (data){
        if (data.success){
          $tr.css('display', 'none');
        }
      });
    } else {
      data.param = 'approve'
      app.utils.ajax.post('/moderate/comment/CRUD', {data: data}).then(function (data){
        if (data.success){
          $tr.css('display', 'none');
        }
      });

    }
  });
  $commentDelete.on('click', function (){
    var $tr = $(this).closest('tr');
    var $commentText = $tr.find('.commentText');
    var data = {
      id: $commentText.data('question'),
      param: 'delete'
    };
    app.utils.ajax.post('/moderate/delete/CRUD', {data: data}).then(function (data){
      if (data.success){
        $tr.css('display', 'none');
      }
    });
  });

}