const Joi = require('@hapi/joi');
const User = require('../models/usersModel.js');

const schema = Joi.object({
    validate_name: Joi.string()
        .min(4)
        .max(20)
        .pattern(/^[a-zA-Z]{4,20}$/),

    validate_password: Joi.string()
        .min(4)
        .max(20)
        .pattern(/^[a-zA-Z0-9]{4,20}$/)
});

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

exports.postSignIn = async function(request, response) {
    if(!request.body.username || !request.body.password) 
        return response.json({message: "Заполните все поля"});

    console.log("\nАвторизация");
    console.log(request.body);

    try {
        //Валидируем данные и сохраняем в объекты
        const validateName = await schema.validateAsync({validate_name: request.body.username});
        const validatePassword = await schema.validateAsync({validate_password: request.body.password});
        console.log(validateName);
        console.log(validatePassword);

        var username = validateName.validate_name;
        var password = validatePassword.validate_password;
    } catch(err) {
        return response.json({
            field: 1,
            message: "Неверный логин и пароль"   //пароль и логин не прошли валидацию
        });
    }

    try {
        const selectUsersLogin = await User  //Ищем пользователя с логином 'username'
            .query()
            .where('login', username);

        console.log(selectUsersLogin);

        if(!selectUsersLogin[0]) {      
            return response.json({
                field: 1,
                message: "Неверный логин"
            });
        }
        if(selectUsersLogin[0]['password'] !== password) {
            return response.json({
                field: 2,
                message: "Неверный пароль"
            });
        }

        request.session.userId = selectUsersLogin[0]['id'];
        request.session.userLogin = selectUsersLogin[0]['login'];
        request.session.userRole = selectUsersLogin[0]['role'];
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
    } catch(err) {
        console.log(err);
        return response.json({
            field: 1,
            message: "Произошла ошибка при запросе"
        });
    }
};
