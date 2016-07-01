app.components.userBio = function($card) {
  var $userBio = $card.find(".userbio");
  app.behaviors.linkify($userBio);
}