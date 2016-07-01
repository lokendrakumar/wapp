app.components.auditionPopupForm = function ($panel) {

  var username = $panel.data('username');
  var $form = $panel.find('form');
  var $submitBtn = $form.find('.submit-btn');
  
  $form.on('submit', function (ev) {
    ev.preventDefault();
    $submitBtn.html('loading...');
    $submitBtn.addClass('disabled');
    var formData = app.utils.getFormData($form);
    formData = JSON.stringify(formData);
    formData = JSON.parse(formData);
    var targetUrl = app.AUDITIONPOPUP.targetUrl + '/apply'
    
    app.utils.ajax.post(targetUrl, {
      data: formData
    }).then(
    function (data) {
      targetUrl = '/widgets/popup/question/' + username + '?partials[]=auditionQuestions';
      
      app.utils.ajax.get(targetUrl, {
      data: {
        author: app.AUDITIONPOPUP.createdBy,
        offset: 0,
        limit: 10
        }
      }).then(
      function (data) {
        app.AUDITIONPOPUP.panel.html(data.auditionQuestions);
      },
      function (err) {
        $submitBtn.html('Proceed');
        $submitBtn.removeClass('disabled');
      }
      );
    });
  });
}