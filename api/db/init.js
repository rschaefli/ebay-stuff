'use strict';

var pgp = require('pg-promise')();

var connection = {
  host: 'localhost',
  port: 5433,
  database: 'my-database-name',
  user: 'user-name',
  password: 'user-password'
};

module.exports = pgp(connection);
