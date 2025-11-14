const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: "localhost",
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
