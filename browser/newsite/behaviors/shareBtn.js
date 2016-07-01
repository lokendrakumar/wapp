app.behaviors.shareBtn = function (shareSelector, $shareIcon) {
  var share = new Share(shareSelector, {
    url: $shareIcon.data('url')
  });

  $shareIcon.hover(
    function () {
      share.open();
    },
    function () {
      share.close();
    }
  );
};