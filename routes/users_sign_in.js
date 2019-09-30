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

//Открытие страницы авторизации
router.get("/", function(request, response) {
    if(request.session.userLogin) {
        console.log("Есть куки файлы");
        console.log(`\tin login if true: `, request.session.userLogin)
        console.log(`\trequest.headers['cookie']: `, request.headers['cookie']);
        response.redirect("/index");
    }
    else {
        console.log("Нет куки файлов");
        console.log(`\tin login if false: `, request.session.userLogin)
        console.log(`\trequest.headers['cookie']: `, request.headers['cookie']);
        response.render("users_sign_in.hbs");
    }
});

router.post("/", function(request, response) {
    if(!request.body.username || !request.body.password) 
        return response.json({message: "Заполните все поля"});

    console.log("\tавторизация: ");
    console.log(request.body);
    let username = request.body.username;
    let password = request.body.password;
    var str = `SELECT * from users_login WHERE login = '${username}'`;
    console.log(str);
    pool.query(`SELECT * from users_login WHERE login = '${username}'`, function(err1, data) {
        if(data[0]) {
            console.log(data);
            if(data[0]['password'] == password){
                    request.session.userId = data[0]['id'];
                    request.session.userLogin = data[0]['login'];
                    request.session.userRole = data[0]['role'];
                    console.log(request.session);
                    
                    if(request.session.userRole == 0) {
                        response.json({
                            field: 0,
                            message: ""
                        });
                    } else {
                        response.json({
                            field: 2,
                            message: "Нет разрешённого доступа!"
                        });
                    }
            }    
            else {
                response.json({
                    field: 2,
                    message: "Неверный пароль"
                });
            }
           
        } 
        else {
            response.json({
                field: 1,
                message: "Неверный логин"
            });
        }
    });
});

module.exports = router;