const mysql = require('mysql');

const connection = mysql.createPool({
  host: 'bg0crc83dfwlxg2hnogi-mysql.services.clever-cloud.com',
  user: 'ugrsqhfdjcrtqloy',
  password: 'cDuEnPXZJlZSm2C1MXC1',
  database: 'bg0crc83dfwlxg2hnogi',
  port: 3306,
});

if (connection) {
  console.log('db ok');
}

module.exports = connection;
