const pool = require('../models/connection.js');

//Открытие страницы Все табели
exports.getPageAllReportCards = function(request, response){
    if(request.session.userRole == 0 && request.session.userLogin) {
        return response.render("all_report_cards.hbs");
    } 
    else {
        console.log("Вы не авторизованы!");
        return response.redirect(301, "/");
    }
};
