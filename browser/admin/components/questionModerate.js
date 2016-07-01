app.components.questionModerate = function ($tbody) {

  var $questionText = $tbody.find('.questionText');
  var $questionApprove = $tbody.find('.questionApprove');
  var $questionDelete = $tbody.find('.questionDelete');

  var CRUDPost = function (data, $tr) {
    app.utils.ajax.post('/moderate/question/CRUD', {data: data}).then(function (data){
      if (data.success){
        $tr.css('display', 'none');
      }
    });
  };

  $questionText.on('click', function () {
    $(this).data('flag', true);
  });

  $questionApprove.on('click', function (){
    var $tr = $(this).closest('tr');
    var $questionText = $tr.find('.questionText');
    var data = {
      body: $questionText.html(),
      id: $questionText.data('question'),
    }
    if($questionText.data('flag')){
      data.param = 'edit/approve';
    } else {
      data.param = 'approve';
    }
    CRUDPost(data, $tr);
  });
  $questionDelete.on('click', function (){
    var $tr = $(this).closest('tr');
    var $questionText = $tr.find('.questionText');
    var data = {
      id: $questionText.data('question'),
      param: 'delete'
    };
    CRUDPost(data, $tr);
  });

}