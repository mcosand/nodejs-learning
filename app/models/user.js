
/**
 * Module dependencies.
 */

var db = new (require('cradle').Connection)().database('sarevents')
  , crypto = require('crypto')

/**
 * Validations
 */

//var validatePresenceOf = function (value) {
//  return value && value.length
//}
//
//// the below 4 validations only apply if you are signing up traditionally
//
//UserSchema.path('name').validate(function (name) {
//  return name.length
//}, 'Name cannot be blank')
//
//UserSchema.path('email').validate(function (email) {
//  return email.length
//}, 'Email cannot be blank')
//
//UserSchema.path('username').validate(function (username) {
//  return username.length
//}, 'Username cannot be blank')
//
//UserSchema.path('hashed_password').validate(function (hashed_password) {
//  return hashed_password.length
//}, 'Password cannot be blank')
//
//
///**
// * Pre-save hook
// */
//
//UserSchema.pre('save', function(next) {
//  if (!this.isNew) return next()
//
//  if (!validatePresenceOf(this.password))
//    next(new Error('Invalid password'))
//  else
//    next()
//})
//
/**
 * Methods
 */

UserSchema = function(data) { 
  this.setPassword = function(newPassword) {
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(newPassword)
  };

  this.save = function(callback) {
    if (! this.hashed_password) {
      callback(new Error('password required'));
      return;
    }
    var d = {
        type: 'user',
        name: this.name,
        email: this.email,
        username: this.username,
        hashed_password: this.hashed_password,
        salt: this.salt,
      };
    if (this._rev) { d._rev = this._rev; }
    
    var handler = function(err, res) {
        this._rev = res._rev;
        callback();
      };
    
    if (this._rev) {
      db.save('user:' + this.username, this._rev, d, handler);
    } else {
      db.save('user:' + this.username, d, handler);
    }
  };
  


  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  this.authenticate = function(plainText) {
  console.log('user;:authenticate');
    return this.encryptPassword(plainText) === this.hashed_password
  };

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  this.makeSalt = function() {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  };

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  this.encryptPassword = function(password) {
    if (!password) return ''
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
  };
  
  
  /**
   * Load / initialize
    */
  if (data && data._rev) { this._rev = data._rev }
  
  this.name = data ? data.name : null;
  this.email = data ? data.email : null;
  this.username = data ? data.username : null;
  this.salt = data ? data.salt : null;
  this.hashed_password = data ? data.hashed_password : null;

  
  if (data && data.password) this.setPassword(data.password);
}

module.exports = UserSchema;
module.exports.byUsername = function(username, callback) {
  db.view('users/byUsername', { key: username }, function (err, doc) {
    console.log(doc);
    var user = new UserSchema(doc[0].value);
    if (callback) callback(null, user);
  });
};
