const pool = require('../models/connection.js');

//Открытие страницы авторизации
exports.getPageSignIn = function(request, response) {
    if(request.session.userLogin) {
        console.log("Есть куки файлы");
        console.log(`\tin login if true: `, request.session.userLogin)
        console.log(`\trequest.headers['cookie']: `, request.headers['cookie']);
        return response.redirect("/index");
    }
    else {
        console.log("Нет куки файлов");
        console.log(`\tin login if false: `, request.session.userLogin)
        console.log(`\trequest.headers['cookie']: `, request.headers['cookie']);
        return response.render("users_sign_in.hbs");
    }
};

exports.postSignIn = function(request, response) {
    if(!request.body.username || !request.body.password) 
        return response.json({message: "Заполните все поля"});

    let username = request.body.username;
    let password = request.body.password;

    pool.query(`SELECT * from users_login WHERE login = '${username}'`, function(err1, data) {
        console.log(data);

        if(!data[0]) { 
            return response.json({
                field: 1,
                message: "Неверный логин"
            }); 
        } 
 
        if(data[0]['password'] !== password){ 
            return response.json({
                field: 2,
                message: "Неверный пароль"
            });
        }
            
        request.session.userId = data[0]['id'];
        request.session.userLogin = data[0]['login'];
        request.session.userRole = data[0]['role'];
        console.log(request.session);
                    
        if(request.session.userRole !== 0) { 
            return response.json({
                field: 2,
                message: "Нет разрешённого доступа!"
            });
        }

        return response.json({
            field: 0,
            message: ""
        });
                    
    });
};
