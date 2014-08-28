
var async = require('async')

module.exports = function (express, app, passport, auth) {

  // user routes
  var users = require('../app/controllers/users')
  var r = express.Router();
  
  r.get('/signin', users.signin)
  r.get('/signup', users.signup)
  r.get('/signout', users.signout)
  r.post('/users', users.create)
  r.post('/users/session', passport.authenticate('local', {failureRedirect: '/signin', failureFlash: 'Invalid email or password.'}), users.session)
  r.get('/users/me', users.me)
  r.get('/users/:userId', users.show)
  
  r.param('userId', users.user)
 
  // home route
  var index = require('../app/controllers/index')
  r.get('/', index.render)
 
  app.use('/', r);
 
}
