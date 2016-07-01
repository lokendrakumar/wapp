app.components.showcasedUsers = function ($panel) {
  var $showCase = $panel.find('.showcase');
  var $categories = $panel.find('.categories');

  $categories.find('dd.category:first').addClass('active');

  $categories.find('dd.category > a').on('click', function (ev) {
    ev.preventDefault();
    var $a = $(this);
    var $dd = $a.parent();

    $dd.siblings('.active').removeClass('active');
    $dd.addClass('active');

    $showCase.fadeOut(200, function () {
      $showCase.html(app.utils.preloaderHtml());
      $showCase.show();
      app.utils.ajax.get('/', {
        data: { cat: $a.data('id'), partials: ['showcase'] }
      }).then(function (partials) {
        $showCase.hide();
        $showCase.html(partials.showcase);
        $showCase.fadeIn(200);
      });
    });
  });
};
