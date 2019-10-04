const pool = require('../models/connection.js');

//Открытие страницы регистрации       
exports.getPageLogin = function(request, response) {
    if(request.session.userLogin) {
        return response.redirect("/index");
    } 
    else {
        return response.render("users_login.hbs");
    }
};

exports.postLogin = function(request, response) {
    if(!request.body.username || !request.body.password) {
        return response.json({message: "Заполните все поля"});
    }

    console.log("регистрация: ");
    console.log(request.cookies);
    console.log(request.body);

    let username = request.body.username;
    let password = request.body.password;

    if(username.length < 5 || username.length > 16) {
        return response.json({
            field: 1,
            message: "Введите количество символов больше 4 и меньше 16"
        });
    } 
    
    if(password.length < 5 || password.length > 16) {
        return response.json({
            field: 2,
            message: "Введите длину пароля больше 4 символов и меньше 16"
        });
    }  
    
    pool.query(`SELECT * from users_login WHERE login = '${username}'`, function(err, data1) {
        if(data1[0]) { 
            console.log(data1[0]);

            if(data1[0]['login']) {
                return response.json({
                    field: 1,
                    message: "Пользователь с таким логином уже зарегистрирован. Введите другой логин"
                });
            } 
        } 
        else {
            pool.query("INSERT INTO users_login(login, password, role) VALUES(?,?,?)", [username, password, 0], 
            function(err, data2) {
                if(err) {
                    return response.json({
                    field: 1,
                    message: "Произошла ошибка. Введите данные повторно"
                    });
                }
                request.session.userId = data2['insertId'];
                request.session.userLogin = username;
                request.session.userRole = 0;
                console.log(request.session);
                return response.json({
                    field: 0,
                    message: "Вы успешно зарегистрированы!"
                });
            }); 
        } 
    });
};
