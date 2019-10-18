const User = require('../models/usersModel.js');

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