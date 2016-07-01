// get current page url
app.utils.currentUrl = function (withSearch) {
  var urlParts = [location.protocol, '//', location.host, location.pathname];
  if (withSearch === true) {
    return urlParts.concat([location.search]).join('');
  } else {
    return urlParts.join('');
  }
};

// get website domain
app.utils.domain = function () {
  return [location.protocol, '//', location.host].join('');
};

app.utils.site = function (path) {
  return [location.protocol, '//', location.host,'/',path].join('');
};

app.utils.runningVideos = [];

app.utils.preloaderHtml = function () {
  return (
    '<div class="row text-center">'+
      '<div class="small-1 columns small-centered">'+
        '<img class="img-h" src="/img/preloader.gif"/>'+
      '</div>'+
    '</div>'
  );
};

// setting up commonly used functions
app.utils.$elInViewport = function($el) {
  var el = $el.get(0);

  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;
  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top >= window.pageYOffset &&
    left >= window.pageXOffset &&
    (top + height) <= (window.pageYOffset + window.innerHeight) &&
    (left + width) <= (window.pageXOffset + window.innerWidth)
  );
};

// check if $el was removed
app.utils.$elRemoved = function(domNodeRemovedEvent, $el) {
  var $evTarget = $(domNodeRemovedEvent.target);

  return $evTarget.get(0) === $el.get(0) || $.contains($evTarget.get(0), $el.get(0));
};

app.utils.loadingBtn = function(id,d){
  var ID = $('#'+id);
  var org=ID.text();
  var orgVal=ID.val();
  ID.val("Processing...");
  ID.text("Processing...");
  ID.addClass('loading disabled');
  //var ref=this;
    if (d!=0){
     setTimeout(function() {
      ID.removeClass('loading disabled');
      ID.text(org);
      //ID.val(orgVal);
    }, d*1000);
  } 
};

app.utils.loadingBtnStop = function(id,value,result){
  var org=value;
  var ID = $('#'+id);
  ID.removeClass('loading').val(org);
  if (result=='success'){
    app.utils.notify('Your question was asked successfully','success', 2);
  } else {
    app.utils.notify('{{error code}} Error message from server','error', 2);
  }
};

app.utils.notify = function(text,type,duration){
  
    $('#alert-box').fadeIn().addClass(type).html(text + '<a href="#" class="close">&times;</a>');
  
  //Types are: alert, success, warning, info 
    if (duration!=0){
    setTimeout(function() {
      $('.alert-box').removeClass(type).fadeOut().html('loading <a href="#" class="close">&times;</a>');
    }, duration*1000); 
  }
  $(document).on('close.alert', function(event) {
    $('#alert-hook').html('<div data-alert id="alert-box" class="alert-box-wrapper alert-box alert radius" style="display:none;"> Loading... <a href="#" class="close">&times;</a> </div>');
  });
};

app.utils.notifyLogin = function(text,type,duration){
  
    
     $('#alert-hook2').fadeIn();
    $('#alert-box2').fadeIn().addClass(type).html(text + '<a href="#" class="close">&times;</a>');
    
  // Types are: alert, success, warning, info 
    if (duration!=0){
    setTimeout(function() {
      $('.alert-box').removeClass(type).fadeOut().html('loading <a href="#" class="close">&times;</a>');
    }, duration*1000); 
  }
  $(document).on('close.alert', function(event) {
    $('#alert-hook2').html('<div data-alert id="alert-box" class=" alert-box alert radius" style="display:none;"> Loading... <a href="#" class="close">&times;</a> </div>');
  });
};


app.utils.internet = function() {
  //console.log('connectivty being monitored');
  window.addEventListener("offline", function(e) {
    app.utils.notify('internet connectivty lost. Please check your connection.', 'error', 0);
  }, false);

  window.addEventListener("online", function(e) {
    app.utils.notify('internet connectivty restored', 'success', 3);
  }, false);
};

app.utils.redirectTo = function (path) {
  window.location.href = app.utils.domain()+path;
};

app.utils.reloadNavAndPanel = function () {
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav', 'panel']}
  }).then(function () {
    //$(document).foundation();
  });
};

app.utils.reloadNavOnly = function () {
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav']}
  }).then(function () {
    $(document).foundation();
  });
};

app.utils.get$videoSnapshotUrl = function ($video) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var video = $video[0];
  var videoWidth = video.videoWidth;
  var videoHeight = isNaN(video.videoHeight) ? (0.75 * videoWidth) : videoWidth;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  context.drawImage(video, 0, 0, videoWidth, videoHeight);
  return canvas.toDataURL('image/png');
};

app.utils.dataURLToBlob = function (dataURL) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURL.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURL.split(',')[1]);
  else
    byteString = unescape(dataURL.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type: mimeString});
};

app.utils.blobToFile = function (blob, fileName) {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  blob.lastModifiedDate = new Date();
  var ext = blob.type.split('/').reverse()[0];
  blob.name = fileName+'.'+ext;
  return blob;
};

app.utils.dataURLToFile = function (dataURL, fileName) {
  return app.utils.blobToFile(app.utils.dataURLToBlob(dataURL), fileName);
};

app.utils.btnStateChange = function (button, message, disabled) {
  var $button = button;
  var imgHtml =  '<img src="/img/preloader.gif" class="left"/>'+
                  '<div class="inBtnState">'+
                  '</div>';
  
  
  if (disabled) {
    $button.addClass('fullbtn');
    $button.html(imgHtml);
    var $inBtnState = $button.find('.inBtnState');
    $inBtnState.html(message);
    
    $button.addClass('disabled');
  } else {
    $button.removeClass('fullbtn');
    $button.removeClass('disabled');    
    $button.html(message);
  }

};

app.utils.requestSerializer = function (method, url, params) {
  app.requestArgs.method = method;
  app.requestArgs.url = url;
  app.requestArgs.params = params;
}

var getParameterByName = function (name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

app.utils.requestDeserializer = function (args) {
  app.utils.ajax(args.method, args.url, args.params);
  var resourceId = getParameterByName('resourceId');
  var type = getParameterByName('type');
  if (args.url.indexOf('me') > -1) {
    app.utils.ajax.get('/recorder/recorder', {
      data: {
        partials: ['shareCard']
      }
    }).then(function (data) {
      var $shareCard = $(data.shareCard);
      $shareCard.find('.shareContainer').data("question-id", resourceId);
      $shareCard.find('.shareContainer').data("type", type);

      app.$body.html($shareCard[0]);
      //$card.find('.shareContainer').data("question-id", resourceId) ;
      //console.log( $card.find('.shareContainer').data("question-id"))

    });
  }
  // app.utils.reloadNavAndPanel();
}