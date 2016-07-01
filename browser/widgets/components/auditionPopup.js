app.components.auditionPopup = function ($panel) {

  var $profileContainer = $panel.find('.profiles-list');
  var $nextBtn = $profileContainer.find('.next-btn');
  var createdBy = $panel.data('creater');
  var profileId;
  var targetUrl;

  app.AUDITIONPOPUP = (app.AUDITIONPOPUP === undefined)? {targetUrl: "", panel: $panel, createdBy: createdBy} : app.AUDITIONPOPUP;

  $nextBtn.on('click', function (ev) {
    ev.preventDefault();
    var $profile = $profileContainer.find('.profile:checked');
    profileId = $profile.val();
    app.AUDITIONPOPUP.targetUrl = $profile.data('url');
    targetUrl = app.AUDITIONPOPUP.targetUrl + '/form?partials[]=form';
    
    app.utils.ajax.get(targetUrl
    ).
    then(function(data) {
      if (data.status == 'applied') {
        var username = data.user.username;
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
        });    
      } else {
      $panel.html(data.form);
      }
    });
  });


};