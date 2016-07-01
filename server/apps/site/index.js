var app = module.exports = require('express')();

app.use(function (req, res, next) {
  // overriding view function provided inside templates
  // for routes that 
  res.locals.view = require('view').prefix('site');
  next();
});

app.use('/', require('./routes/statics'));
app.use('/', require('./routes/career'));
app.use('/', require('./routes/campaign'));
app.use('/', require('./routes/me/pages'));
app.use('/', require('./routes/me/ajax'));
app.use('/', require('./routes/ajax'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/modals'));
app.use('/', require('./routes/popups'));
app.use('/', require('./routes/share'));
app.use('/', require('./routes/pages'));