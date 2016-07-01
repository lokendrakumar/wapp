var loc = "http://frankly.me/widgets/";
var franklywidget = function () {
  var elem = document.getElementsByClassName('franklywidget');
  for(var i = 0; i < elem.length; i++) {
    var height = elem[i].getAttribute('data-height');
    var width = elem[i].getAttribute('data-width');
    var user = elem[i].getAttribute('data-user');
    var widget = elem[i].getAttribute('data-widget');
    var query = elem[i].getAttribute('data-query');
    var flag = elem[i].getAttribute('data-flag-redirect');
    var content = "<iframe frameborder=0 height='100%' width='100%' src='";
    var contentEnd = "'></iframe>";
    var parentUrl = document.location.href;
    console.log("js", parentUrl);
    elem[i].style.height=height+'px';
    elem[i].style.width=width+'px';
    elem[i].setAttribute('style', 'width: '+width+'px; height: '+height+'px; margin:auto;');
    elem[i].innerHTML = content + loc + widget + (user == '' ? '' : '/' + user) + (query == '' ? '' : '/'+query) +'?flagRedirect=' + flag + '&url=' + parentUrl + contentEnd;
  }
};
(function () {
  setTimeout(franklywidget(), 5000);
})();