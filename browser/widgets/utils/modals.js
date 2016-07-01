// modal bg-z-index
app.utils.modalBgZIndex = 1000;

// load a particular modal via its selector
// optionally provide html via a url
// and run an optional callback on completion
app.utils.loadModal = function (selector, url, callback, stacked) {
  // modals stack by default, ie. more than one modals can open at a time
  var stacked = stacked === false ? false : true;

  var modalLoader = function () {
    callback = typeof(callback) === 'function' ? callback : function () { };

    // if selector provided is an instance of jquery, then that is our modal
    // otherwise we try to find the modal using jquery
    var $modal = selector instanceof $ ? selector : $(selector);

    // if the modal provided is not one single modal, do nothing
    if ($modal.length !== 1) return;

    // attach and animate modal bg if it is not loaded already
    var $modalBg = $('div.reveal-modal-bg');
    if ($modalBg.length === 0) {
      $modalBg = $($.parseHTML('<div class="reveal-modal-bg" style="display: none;"></div>'));
      //app.$body.append($modalBg);
      $modalBg.css({zIndex: app.utils.modalBgZIndex}).fadeIn(200);
    }

    var openModal = function () {
      // get modalIndex
      var modalIndex = $('div.reveal-modal.open').length + 1;
      // hook in the modal closer
      $modal.find('i.icon-close').on('click', function () { app.utils.unloadModal($modal); });
      var $modalMaterialize = $modal.find('.modal');
      $modalMaterialize.addClass('open').css({
        display: 'block',
        visibility: 'visible',
        zIndex: app.utils.modalBgZIndex + 1
      });

      // open the modal
      $modalMaterialize.css('top', '50px');
      $modalMaterialize.animate(
        {
          opacity: 1
        }, 
        {
          complete: function () {
            app.vent.trigger('modal.opened', $modal);
            callback();
          }
        }
      );
    };

    if (url === undefined || url === null) {
      openModal();
    } else {
      console.log(url);
      app.utils.ajax.get(url).then(function (html) {
        $modal.html(html);
        openModal();        
      });
    }

    // close modal on clicking modal bg
    $modalBg.on('click', app.utils.unloadOpenModals);
  };

  // if the loadModal call is not stacked, then unloadOpenModals before
  // loading our target modal. Otherwise just load our modal
  if (! stacked) {
    app.utils.unloadOpenModals(modalLoader);
  } else {
    modalLoader();
  }
};

// unload $modal
app.utils.unloadModal = function ($modal, callback) {
  callback = typeof(callback) === 'function' ? callback : function () { };
  console.log('close');
  if ($modal.length > 0) {
    $modal.animate(
      {
        opacity: 0,
        top: '-'+(app.$window.scrollTop() + 100)+'px'
      },
      {
        done: function () {
          $modal.removeClass('open').css({display: 'none', visibility: 'none'});

          app.vent.trigger('modal.closed', $modal[0]);
          callback();

          var $openModals = $('div.reveal-modal.open');
          if ($openModals.length === 0) {
            var $modalBg = $('div.reveal-modal-bg');
            $modalBg.fadeOut(200, function () {
              $modalBg.remove();
            });
          }
        }
      }
    );
  } else {
    callback();
  }
};

// unload already opened modal and call a callback
app.utils.unloadOpenModals = function (callback) {
  callback = typeof(callback) === 'function' ? callback : function () { };

  var $modals = $('div.reveal-modal.open');

  app.utils.unloadModal($modals, callback);
}

// close any open modal escape key press event
app.$document.on('keyup', function (ev) {
  if (ev.keyCode === 27) {
    app.utils.unloadOpenModals();
  }
});