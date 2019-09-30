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

//Открытие страницы регистрации       
router.get("/login", function(request, response) {
    response.render("users_login.hbs");
});

router.post("/login", function(request, response) {
    if(!request.body.username || !request.body.password) 
        return response.json({message: "Заполните все поля"});
    console.log("регистрация: ");
    console.log(request.cookies);
    console.log(request.body);

    let username = request.body.username;
    let password = request.body.password;
    if(username.length < 5 || username.length > 16) {
        response.json({
            field: 1,
            message: "Введите количество символов больше 4 и меньше 16"
        });
    } else if(password.length < 5 || password.length > 16) {
        response.json({
            field: 2,
            message: "Введите длину пароля больше 4 символов и меньше 16"
        });
    } else {
        pool.query(`SELECT * from users_login WHERE login = '${username}'`, function(err, data1) {
            if(data1[0]) {
                console.log(data1[0]);

                if(data1[0]['login']) {
                    response.json({
                        field: 1,
                        message: "Пользователь с таким логином уже зарегистрирован. Введите другой логин"
                    });
                } 
            } 
            else {
                pool.query("INSERT INTO users_login(login, password, role) VALUES(?,?,?)", [username, password, 0], 
                function(err, data2) {
                    if(err) {
                        response.json({
                        field: 1,
                        message: "Произошла ошибка. Введите данные повторно"
                        });
                    }
                    request.session.userId = data2['insertId'];
                    request.session.userLogin = username;
                    request.session.userRole = 0;
                    console.log(request.session);
                    response.json({
                        field: 0,
                        message: "Вы успешно зарегистрированы!"
                    });
                }); 
            } 
        });
    }
});

module.exports = router;