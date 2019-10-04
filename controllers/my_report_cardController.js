const pool = require('../models/connection.js');

//Открытие страницы Мой табель
exports.getPageMyReportCard = function(request, response){
    if(request.session.userRole == 0 && request.session.userLogin) {
        return response.render("my_report_card.hbs");
    } 
    else {
        console.log("Вы не авторизованы!");
        return response.redirect(301, "/");
    }
};
