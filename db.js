
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'nodejsTask4',
  password: '',
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('db ok');
  }
});


module.exports = connection