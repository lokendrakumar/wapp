var app = module.exports = require('express')();

app.use(function (req, res, next) {
  // overriding view function provided inside templates
  // for routes that 
  res.locals.view = require('view').prefix('recorder');
  next();
});


app.use('/', require('./routes/modals'));
app.use('/', require('./routes/pages'));
