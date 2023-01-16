const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Pass@1122',
  database: 'vrbo',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
})