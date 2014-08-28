
var LocalStrategy = require('passport-local').Strategy
  , User = require('../app/models/user.js')

module.exports = function (passport, config) {
  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.username)
  })

  passport.deserializeUser(function(username, done) {
    User.byUsername(username, function (err, user) {
      done(err, user)
    })
  })

  // use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function(username, password, done) {
      User.byUsername(username, function (err, user) {
        if (err) { return done(err) }
        
        if (!user) {
          return done(null, false, { message: 'Unknown user' })
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' })
        }
        return done(null, user)
      })
    }
  ))
}
