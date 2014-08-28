/**
 * Module dependencies.
 */

var express = require('express')
  , flash = require('connect-flash')
  , helpers = require('view-helpers')
  , compression = require('compression')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , methodOverride = require('method-override')
  , favicon = require('static-favicon')
  , MemoryStore = require('connect').session.MemoryStore
  
module.exports = function (app, config, passport, routes) {

  app.set('showStackError', true)
  // should be placed before express.static
  
  app.use(compression({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }))
  
  app.use(favicon(__dirname + '/../public/img/icons/favicon.ico'))
  app.use(express.static(config.root + '/public'))

  // don't use logger for test env
/*
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.logger('dev'))
  }
*/
  // set views path, template engine and default layout
  app.set('views', config.root + '/app/views')
  app.set('view engine', 'jade')
  
  // enable jsonp
  app.enable("jsonp callback")


  // dynamic helpers
  app.use(helpers(config.app.name))

  // cookieParser should be above session
  app.use(cookieParser())

  // bodyParser should be above methodOverride
  app.use(bodyParser())
  app.use(methodOverride())

  // express/mongo session storage
  app.use(session({
    secret: 'ngFantasyFootball',
    store: new MemoryStore({
      reapInterval: 1000 * 60
    })
  }))

  // connect flash for flash messages
  app.use(flash())

  // use passport session
  app.use(passport.initialize())
  app.use(passport.session())

  // routes should be at the last
  routes();

  // assume "not found" in the error msgs
  // is a 404. this is somewhat silly, but
  // valid, you can do whatever you like, set
  // properties, use instanceof etc.
  app.use(function(err, req, res, next){
    // treat as 404
    if (~err.message.indexOf('not found')) return next()

    // log it
    console.error(err.stack)

    // error page
    res.status(500).render('500', { error: err.stack })
  })

  // assume 404 since no middleware responded
  app.use(function(req, res, next){
  res.status(404).render('404', { url: req.originalUrl, error: 'Not found' })
  })
}
