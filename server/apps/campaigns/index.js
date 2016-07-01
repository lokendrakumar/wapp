var app = module.exports = require('express')();



app.use(function (req, res, next) {
  res.locals.view = require('view').prefix('campaigns');
  next();
});

app.use('/', require('./routes/pages'));

