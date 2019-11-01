const Joi = require('@hapi/joi');

const User = require('../models/usersModel.js');

const schema = Joi.object({
    username: Joi.string()
        .min(4)
        .max(20)
        .pattern(/^[a-zA-Z]{4,20}$/),

    password: Joi.string()
        .min(4)
        .max(20)
        .pattern(/^[a-zA-Z0-9]{4,20}$/)
});

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

exports.postLogin = async function(request, response) {
    if(!request.body.username || !request.body.password) {
        return response.json({message: "Заполните все поля"});
    }

    console.log("\nрегистрация: ");
    console.log(request.body);

    try {
        //Валидируем данные логина и сохраняем в объект
        const validateName = await schema.validateAsync({
            username: request.body.username
        });
        console.log(validateName);
        
        var username = validateName.username;
    } catch(err) {
        console.log(err);
        if(err['details'][0]['type'] == "string.pattern.base") {
            return response.json({
                field: 1,
                message: "Введите латинские символы"
            });
        }

        return response.json({
            field: 1,
            message: "Введите количество символов больше 4 и меньше 20"
        });
    }

    try {
        //Валидируем данные пароли и сохраняем в объект
        const validatePassword = await schema.validateAsync({password: request.body.password});
        console.log(validatePassword);

        var password = validatePassword.password;
    } catch(err) {
        console.log(err);
        if(err['details'][0]['type'] == "string.pattern.base") {
            return response.json({
                field: 2,
                message: "Введите латинские символы и цифры"
            });
        }

        return response.json({
            field: 2,
            message: "Введите количество символов больше 4 и меньше 20"
        });
    }

    try {
        const selectUsersLogin = await User
            .query()
            .where('login', username);   //Ищем пользователя с логином 'username'
        
        if(!isEmpty(selectUsersLogin)) {  //Если пользователь с логином 'username' существует, то не будем регистрировать её
            console.log(selectUsersLogin);
            return response.json({
                field: 1,
                message: "Пользователь с таким логином уже зарегистрирован. Введите другой логин"
            });
        }
        
        const insertUsersLogin = await User 
            .query()
            .insert({ login: username, password: password, role: 0 });

        request.session.userId = insertUsersLogin['id'];
        request.session.userLogin = insertUsersLogin['login'];
        request.session.userRole = insertUsersLogin['role'];
        console.log(request.session); 
        return response.json({
            field: 0,
            message: "Вы успешно зарегистрированы!"
        });
        
    } catch(err) {
        console.log(err);
        return response.json({
            field: 1,
            message: "Произошла ошибка при запросе"
        });
    }
    

};