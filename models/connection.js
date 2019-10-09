const mysql = require("mysql2");

var options = {
    connectionLimit: 5,
    host: "127.0.0.1",
    user: "root",
    database: "employeedb"
}
const pool = mysql.createPool(options); //соединение с базой данных

module.exports = pool;

