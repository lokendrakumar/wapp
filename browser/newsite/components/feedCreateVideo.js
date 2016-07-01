app.components.feedCreateVideo = function ($createVideoPane) {

  var $buttonCreateVideo = $createVideoPane.find('.btn-upload-video');
  var $inputVideoCaption = $createVideoPane.find('.input-video-caption');
  var url = '/recorder/recorder?type=blog&resourceId=';
  var w = 700;
  var h = 600;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  $buttonCreateVideo.on('click', function (ev) {
    ev.preventDefault();
    if ($inputVideoCaption.val()) {
      url = url + $inputVideoCaption.val()
      window.open(url, '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
      $inputVideoCaption.val('');
    } else {
      Materialize.toast('Enter a nice caption', 4000, 'red lighten-2');
    }
  });
}