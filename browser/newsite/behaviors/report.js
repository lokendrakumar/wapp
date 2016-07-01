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
        Materialize.toast('Your report has been registered successfully. The ' + type + ' has been reported.', 4000);
      },
      function (err) {
        Materialize.toast('Unable to report. Please try again later.', 4000);
      }
    );
  });
};