const pool = require('../models/connection.js');

//Открытие страницы Об учреждении
exports.getPageOrganization = function(request, response) {
    if(request.session.userRole == 0 && request.session.userLogin) {
        return response.render("organization.hbs");
    } 
    else {
        console.log("Вы не авторизованы!");
        return response.redirect(301, "/");
    }
};
