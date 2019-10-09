const User = require('../models/users_loginModel.js');
//const pool = require('../models/connection.js');

function isEmpty(object){  //функция, которая проверяет пуст ли масссив объектов
    for(i in object){
        return false;
    }
    return true;
}

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

    let username = request.body.username;
    let password = request.body.password;

    if(username.length < 5) {
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

    User.findAll({
        where: {login: username}, raw: true 
    }).then(user_login => {
        if(!isEmpty(user_login)) {
            if(user_login[0]['login']) {
                return response.json({
                    field: 1,
                    message: "Пользователь с таким логином уже зарегистрирован. Введите другой логин"
                });
            }
        }

        User.create({
            login: username,
            password: password,
            role: 0
        }).then(res => {

                request.session.userId = res['dataValues']['id'];
                request.session.userLogin = username;
                request.session.userRole = 0;
                console.log(request.session);
                console.log(res['dataValues']['id']);
                return response.json({
                    field: 0,
                    message: "Вы успешно зарегистрированы!"
                });
            }
        ).catch((err) => {
                return response.json({
                    field: 1,
                    message: "Произошла ошибка. Введите данные повторно"
                });
            }
        );
        
    }).catch(err => {
        console.log(err);
        return response.json({message: "Произошла ошибка при запросе!"});
    });
};

    /*pool.query("SELECT * from users_logins WHERE ?", {login: username}, function(err, data1) {
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
            pool.query("INSERT INTO users_logins(login, password, role) VALUES(?,?,?)", [username, password, 0], 
            function(err, data2) {
                if(err) {
                    return response.json({
                    field: 1,
                    message: "Произошла ошибка. Введите данные повторно"
                    });
                }
                console.log(data2);
                console.log(data2['insertId']);
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
    });*/