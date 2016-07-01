var app = module.exports = require('express')();
var _ = require('lodash');

var view = require('view').prefix('site');
var pages = require('apps/site/pages');

app.get('/jobs', function (req, res) {
  var args = {
    pagename: 'Hiring',
    title: 'Hiring | Frankly.me',
    partials: pages.statics.hiring
  };
  
  res.render(pages.statics.hiring.main, args);
});

app.get('/about', function (req, res) {
  var args = {
    pagename: 'About',
    title: 'About | Frankly.me',
    partials: pages.statics.about
  };
  
  res.render(pages.statics.about.main, args);
});

app.get('/tos', function (req, res) {
  var args = {
    pagename: 'ToS',
    title: 'ToS | Frankly.me',
    partials: pages.statics.tos
  };
  
  res.render(pages.statics.tos.main, args);
});

app.get('/contact', function (req, res) {
  var args = {
    pagename: 'Contact',
    title: 'Contact | Frankly.me',
    partials: pages.statics.contact
  };
  
  res.render(pages.statics.contact.main, args);
});

app.get('/privacy', function (req, res) {
  var args = {
    pagename: 'Privacy',
    title: 'Privacy | Frankly.me',
    partials: pages.statics.privacy
  };

  res.render(pages.statics.privacy.main, args);
});