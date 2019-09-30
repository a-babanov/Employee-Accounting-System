const express = require('express');
const mysql = require("mysql2");
var router = express.Router();

var options = {
    connectionLimit: 5,
    host: "127.0.0.1",
    user: "root",
    database: "employeedb"
}
const pool = mysql.createPool(options); //соединение с базой данных

//Открытие страницы Все табели
router.get("/all_report_cards", function(request, response){
    if(request.session.userRole == 0 && request.session.userLogin) {
        response.render("all_report_cards.hbs");
    } 
    else {
        console.log("Вы не авторизованы!");
        response.redirect(301, "/");
    }
});

module.exports = router;