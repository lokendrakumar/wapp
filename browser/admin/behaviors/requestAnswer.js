app.behaviors.requestAnswer = function ($requestBtn, isShare) {

  var buttonBehavior = function (state, requestUrl) {

    if (state === "request") {

      $requestBtn.addClass('success');
      $requestBtn.data('target', requestUrl.replace('request-answer', 'downvote-answer'));
      $requestBtn.data('state', 'downvote');
      $requestBtn.removeClass('sec');
      $requestBtn.html('<i class="icon-check"></i> Answer Requested');
      $requestBtn.removeClass("disabled");
      //app.utils.btnStateChange($requestBtn, '<i class="icon-check"></i> Answer Requested', false);
    } else if (state === "downvote") {

      $requestBtn.removeClass('success');
      $requestBtn.data('target', requestUrl.replace('downvote-answer', 'request-answer'));
      $requestBtn.data('state', 'request');
      $requestBtn.addClass('sec');
      $requestBtn.html('Request Answer');
      $requestBtn.removeClass("disabled");

      app.utils.btnStateChange($requestBtn, "Request Answer", false)
    }
    $requestBtn.fadeIn(100);
  };

  $requestBtn.on('click', function (ev) {
    app.utils.btnStateChange($requestBtn, "Processing...", true);
    var requestUrl = $requestBtn.data('target');
    var state = $requestBtn.data('state');
    app.utils.ajax.post(requestUrl)
      .then(function () {
        console.log("yes");
        buttonBehavior(state, requestUrl);
      },
      function (xhr) {
        app.utils.btnStateChange($requestBtn, "Request Answer", false);
        if (xhr.status !== 401) {

        }
      });
  });
};