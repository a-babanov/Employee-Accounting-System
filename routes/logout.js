var express = require('express');
const mysql = require("mysql2");
var router = express.Router();

var options = {
    connectionLimit: 5,
    host: "127.0.0.1",
    user: "root",
    database: "employeedb"
}

const pool = mysql.createPool(options); //соединение с базой данных

router.get("/logout", function(request, response){
    if(request.session) {
        console.log("\t\tlogout");
        request.session.destroy(function(){
            request.headers['cookie'] = "";
            request.cookies = "";
            response.redirect("/");
        });
    }
    else {
        response.redirect("/");
    }
});

module.exports = router;