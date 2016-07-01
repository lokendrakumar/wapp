var view = require('view').prefix('recorder');
var _ = require('lodash');


var pages = module.exports = {
  recorder: {
    main: view('pages/recorder'),
    auth: view('/components/auth'),
    shareCard: view('pages/shareCard')
  }
    
};

