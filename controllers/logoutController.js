const pool = require('../models/connection.js');

exports.getLogout = function(request, response){
    if(request.session) {
        console.log("\t\tlogout");
        request.session.destroy(function(){
            request.headers['cookie'] = "";
            request.cookies = "";
            return response.redirect("/");
        });
    }
    else {
        return response.redirect("/");
    }
};
