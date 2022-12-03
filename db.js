const mysql = require('mysql2/promise');

// module.exports = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '123abc..',
//   database: 'vrbo',
//   waitForConnections: true,
//   connectionLimit: 20,
//   queueLimit: 0
// })

module.exports = mysql.createPool({
  host: 'db4free.net',
  user: 'vrbo_user',
  password: '123abc..',
  database: 'vrbo_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
})