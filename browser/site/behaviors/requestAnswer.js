app.behaviors.requestAnswer = function ($requestBtn, isShare, $spanYou) {
  var buttonBehavior = function (state, requestUrl) {
    if (isShare) {
      $requestBtn.hide();
    }
    if (state === "request") {
      
      $requestBtn.addClass('success');
      $requestBtn.data('target', requestUrl.replace('request-answer', 'downvote-answer'));
      $requestBtn.data('state', 'downvote');
      $requestBtn.removeClass('sec');
      $requestBtn.html('<i class="icon-check"></i> Answer Requested');
      $requestBtn.removeClass("disabled");
      app.utils.btnStateChange($requestBtn, '<i class="icon-check"></i> Answer Requested', false);
      if (!isShare) {
        $spanYou.html('You, ');
      }

    } else if (state === "downvote") {
      
      $requestBtn.removeClass('success');
      $requestBtn.data('target', requestUrl.replace('downvote-answer', 'request-answer'));
      $requestBtn.data('state', 'request');
      $requestBtn.addClass('sec');
      $requestBtn.html('Request Answer');
      $requestBtn.removeClass("disabled");
      app.utils.btnStateChange($requestBtn, "Request Answer", false);
      if (!isShare) {
        $spanYou.html('');
      }
    }

    $requestBtn.fadeIn(100);
  };

  $requestBtn.on('click', function (ev) {
    app.utils.btnStateChange($requestBtn, "Processing...", true);
    var requestUrl = $requestBtn.data('target');
    var state = $requestBtn.data('state');
    app.utils.ajax.post(requestUrl)
      .then(function () {
        buttonBehavior(state, requestUrl);
        if (isShare) {
          $requestBtn.trigger('share');
        }
      },
      function (xhr) {
        app.utils.btnStateChange($requestBtn, "Request Answer", false);
        if (xhr.status !== 401) {

        }
      });
  });

  // $requestBtn.on('share', function () {
  //   $requestBtn.parent().prepend($('<span><i class="icon-facebook fb button tiny alt"></i> <i class="icon-twitter twt button tiny alt"></i> <i class="icon-whatsapp whatsapp button tiny alt hide-for-large-up"></i> <i class="icon-email show-for-large-up button tiny alt"></i></span>').fadeIn());
  // });
};