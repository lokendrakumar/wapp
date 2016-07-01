app.components.askBox = function ($askBox) {

  var $postArea = $askBox.find('.postArea');
  var targetUrl = $askBox.data('target');
  var $askBtn = $askBox.find('.askBtn');


  $postArea.on('keyup', function (ev) {
    app.cache.userQuestion = $postArea.val();
  });

  // set postArea val to cache value
  if (typeof(app.cache.userQuestion) === 'string' && app.cache.userQuestion.length > 0) {
    $postArea.val(app.cache.userQuestion);
  }

  var formData = {
      question: {
        body: $postArea.val()
      }
    };

    $askBtn.on('click', function (ev) {
      if ($postArea.val().length >= 15 && $postArea.val().length <= 300) {
        if(!$postArea.val().trim())
        {
          Materialize.toast("Ask Something",2000);
        }
        else{
        app.utils.btnStateChange($askBtn, 'Asking', true);
        app.utils.ajax.post(targetUrl, {
          data: formData,
        }).then(

          function (data) {
            delete(app.cache.userQuestion);
            app.utils.btnStateChange($askBtn, 'Ask Question', false);
            Materialize.toast('Question Asked Successfully', 2000);
            setTimeout(function () { window.location.reload(); }, 2000);
          },
          function (xhr) {
            console.log(xhr);
          }
        );
        }
      } else {
        if ($postArea.val().length < 15) {
          Materialize.toast('Minimum length is 15', 4000);
        } else if (($postArea.val().length > 300)) {
          Materialize.toast("Maximum length is 300", 2000);
        }

      }
    });
    

  
};