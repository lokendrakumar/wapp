app.behaviors.report = function ($reportButton) {
  
  var id = $reportButton.data('id');
  var type = $reportButton.data('type');

  $reportButton.on('click', function (ev) {
    ev.preventDefault();
    app.utils.ajax.post('/report-abuse', {
      data: {
        id: id,
        type: type,
      }
    }).then(
      function (data) {
        app.utils.notify('Your report has been registered successfully. The ' + type + ' has been reported.', 'success', 4);
      },
      function (err) {
        app.utils.notify('Unable to report. Please try again later.', 'alert', 4);
      }
    );
  });
};