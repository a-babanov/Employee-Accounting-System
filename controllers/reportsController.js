const pool = require('../models/connection.js');

//Открытие страницы Отчёты
exports.getPageReports = function(request, response){
    if(request.session.userRole == 0 && request.session.userLogin) {
        return response.render("reports.hbs");
    } 
    else {
        console.log("Вы не авторизованы!");
        return response.redirect(301, "/");
    }
};
