var app = module.exports = require('express')();


app.use(function (req, res, next) {
  res.locals.view = require('view').prefix('widgets');
  next();
});

app.use('/', require('./routes/modals'));
app.use('/', require('./routes/ajax'));
app.use('/', require('./routes/pages'));
app.use('/', require('./routes/popups'));
app.use('/', require('./routes/auth'));
