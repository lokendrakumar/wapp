var app = module.exports = require('express')();
var _ = require('lodash');

var view = require('view').prefix('newsite');
var pages = require('apps/newsite/partials');

app.get('/jobs', function (req, res) {
  var args = {
    pagename: 'Hiring',
    title: 'Hiring | Frankly.me',
    partials: pages.statics.hiring
  };
  res.redirect("https://angel.co/frankly-me/jobs");
  //res.render(pages.statics.hiring.main, args);
});

app.get('/about', function (req, res) {
  var args = {
    pagename: 'About',
    title: 'About | Frankly.me',
    partials: pages.statics.about,
    deepLink: "android-app://me.frankly/http/frankly.me/about" 

  };

  res.render(pages.statics.about.main, args);
});

app.get('/tos', function (req, res) {
  var args = {
    pagename: 'ToS',
    title: 'ToS | Frankly.me',
    partials: pages.statics.tos,
    deepLink: "android-app://me.frankly/http/frankly.me/tos" 

  };

  res.render(pages.statics.tos.main, args);
});

app.get('/contact', function (req, res) {
  var args = {
    pagename: 'Contact',
    title: 'Contact | Frankly.me',
    partials: pages.statics.contact
  };
  res.redirect("https://frankly.me/widgets/ask/franklyhr/question");
  //res.render(pages.statics.contact.main, args);
});

app.get('/privacy', function (req, res) {
  var args = {
    pagename: 'Privacy',
    title: 'Privacy | Frankly.me',
    partials: pages.statics.privacy,
    deepLink: "android-app://me.frankly/http/frankly.me/privacy" 

  };

  res.render(pages.statics.privacy.main, args);
});


app.get('/team', function (req, res) {
  var args = {
    pagename: 'Team',
    title: 'Team | Frankly.me',
    partials: pages.statics.team
  };
  res.render(pages.statics.team.main, args);
  //res.render(pages.statics.contact.main, args);
});

