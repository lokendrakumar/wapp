app.behaviors.report = function ($reportButton) {
  
  var id = $reportButton.data('id');
  var postType = $reportButton.data('type');


  /**
   * for mixPanel Data
   */
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $reportButton.data('username');
  var userid = $reportButton.data('userid');
  var link = $reportButton.data('entity-link');
  var type = $reportButton.data('entity-type');


  $reportButton.on('click', function (ev) {
    // Google Analytics function
    ga(['send', 'Video', 'Reported', 'Widgets']);
    mixpanel.track(
      'Video Reported',
      {
        'screen_type': screen,
        //'screen_name': screenType,
        'platform': navigator.platform,
        'entity_username': username,
        'entity_userid': userid,
        'entity_link': link,
        //'entity_type': type
      }
    );
    ev.preventDefault();
    app.utils.ajax.post('/report-abuse', {
      data: {
        id: id,
        type: postType
      }
    }).then(
      function (data) {
        Materialize.toast('Your report has been registered successfully. The ' + postType + ' has been reported.', 4000);
      },
      function (err) {
        Materialize.toast('Unable to report. Please try again later.', 4000);
      }
    );
  });
};