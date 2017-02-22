var bcrypt = require('bcrypt-nodejs');

exports.cryptPasswordSync = function(password) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

exports.comparePasswordSync = function(password, userPassword) {
  return bcrypt.compareSync(password, userPassword);
};
