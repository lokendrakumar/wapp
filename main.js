require('engine').setup(function (app) {

  var config = require('config');
  var passport = require('passport');

  // set up static file serving from node
  if (process.env.NODE_SERVE_STATIC === '1') {
    var publicDir = config.app.publicDir;
    app.use(require('serve-static')(publicDir));
  }
  
  // set up app views handling
  app.set('view engine', 'ejs');
  // set up cookies
  app.use(require('cookie-parser')());
  // set up sessions
  var session = require('express-session');
  
  var options = {
    secret: (new Buffer('frankly-webapp')).toString('base64'),
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 24 * 60 * 60 * 1000 /* one day in microseconds */}
  };

  if (process.env.NODE_ENV === 'production' || 1) {
    // use redis in production, where the app is being run in a process cluster
    var RedisStore = require('connect-redis')(session);
    options.store = new RedisStore({
      host: 'localhost',
      port: 6379,
      prefix: 'frankly.sess.',
      // pass: 'a9a9cc5c39d1c3b399f474fe3d054b446884b66eff4c005f6febae2b87eaacca'
    });
  } else {
    var FileStore = require('session-file-store')(session);
    options.store = new FileStore({path: config.app.sessionDir});
  }

  app.use(session(options));

  // REMOVED CSRF PROTECTION FOR NOW TILL AN APPROACH TO TACKLE IT
  // IN FRONTEND CODE IS DECIDED
  // set up csrf protection
  //var csurf = require('csurf');
  //app.use(csurf({cookie: true}));
  // global csrf error handler
  /*
  app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);

    // handle CSRF token errors here
    res.status(403);
    res.send('form tampered with');
  });
  */

  // passportJs support  
  app.use(passport.initialize());
  app.use(passport.session());

  // handle favicon requests
  //if (process.env.NODE_ENV === 'development') {
  var favicon = require('serve-favicon');
  app.use(favicon(__dirname + '/public/img/favicon.ico'));
  //}

  if (process.env.NODE_ENV === 'production') {
    var log = require('metalogger')();
    // catch-all error handler for production
    app.use(function catchAllErrorHandler (err, req, res, next) {
      // emergency means things are going down
      console.log(err);
      log.emergency(err.stack);
      res.sendStatus(500);

      // properly log the errors, and send the response before crushing the process.
      setTimeout(function () {
        process.exit(1);
      }, 500);
    });
  }

  // hook in something for livereload in dev mode
  // load up app routes
  
  app.use(require('routes'));
});
