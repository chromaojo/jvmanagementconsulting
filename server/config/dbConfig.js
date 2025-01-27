require('dotenv').config();
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.MYSQL_ADDON_HOST,
    uri: process.env.MYSQL_ADDON_URI,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    waitForConnections: true,
  });

// const db = mysql.createConnection({

//   host: 'localhost',
//   user: 'root',
//   password: 'Oluchroma234',
//   database: 'jvmc',
//   waitForConnections: true,

// });


// Workbench Setting 
// host: 'localhost',
// user: 'root',
// password: 'Oluchroma234',
// database: 'nica_app',
// waitForConnections: true,


// const db = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'nica_app',
// waitForConnections: true,
// });


db.connect((error) => {
  if (error) {
    console.log("Database Error :", error);
  } else {
    console.log("Database Connected Successfully");
  }
});

module.exports = db;
