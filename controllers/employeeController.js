const pool = require('../models/connection.js');

function correct_date(uncorrect_date) {  //Форматирует дату в виде: "дд-мм-гггг" в вид: "гггг-мм-дд"
    let d = uncorrect_date.slice(0, 2);
    let m = uncorrect_date.slice(3, 5);
    let y = uncorrect_date.slice(6, 10);
    return `${y}-${m}-${d}`;
}

exports.getPageEmployee = function(request, response){
    if(request.session.userRole == 0 && request.session.userLogin) {
        pool.query("SELECT id, employee, DATE_FORMAT(birthDay, '%d.%m.%Y'), DATE_FORMAT(appointmentDay, '%d.%m.%Y'), " +
            "DATE_FORMAT(terminationDay, '%d.%m.%Y') from employees", function(err, data) {
            if(err)
                return console.log(err);

            //форматируем дату в формате %d.%m.%Y
            for(let i=0; i<data.length; i++) {
                data[i]['birthDay'] = data[i]["DATE_FORMAT(birthDay, \'%d.%m.%Y\')"];
                data[i]['appointmentDay'] = data[i]["DATE_FORMAT(appointmentDay, \'%d.%m.%Y\')"];
                data[i]['terminationDay'] = data[i]["DATE_FORMAT(terminationDay, \'%d.%m.%Y\')"];
                data[i]['isTerminationDay'] = false;
                if(data[i]['terminationDay']) {
                    data[i]['isTerminationDay'] = true;     //сотрудник уволен
                }
            }

            //console.log(data);
            return response.render("employee.hbs", {
                employees: data
            });
        });
    } 
    else {
        console.log("Вы не авторизованы!");
        return response.redirect(301, "/");
    }
};


//Обработка формы добавления сотрудника
exports.postAddEmployee = function(request, response){
    if(!request.body)
        return response.sendStatus(400);

    console.log(request.body);
    const name = request.body.employeeName;
    const birthDay = correct_date(request.body.employeeBirthDay);
    const appointmentDay = correct_date(request.body.employeeAppoinmentDay);

    pool.query("INSERT INTO employees(employee, birthDay, appointmentDay) " +
        "VALUES (?,?,?)", [name, birthDay, appointmentDay], function(err, data){
        if(err)
            return console.log(err);

        response.redirect("/employee");
    });
};

//Обработка формы редактирования сотрудника
exports.postEdit = function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    console.log(request.body);
    const id = request.body.id;
    const name = request.body.employeeName;
    const birthDay = correct_date(request.body.employeeBirthDay);
    const appointmentDay = correct_date(request.body.employeeAppoinmentDay);

    if(request.body.employeeTerminationDay) {
        const terminationDay = correct_date(request.body.employeeTerminationDay);
        console.log(terminationDay);

        pool.query("UPDATE employees SET employee=?, birthDay=?, appointmentDay=?, " +
            "terminationDay=? WHERE id=?", [name, birthDay, appointmentDay, terminationDay, id], function(err, data){
            if(err)
                return console.log(err);
            response.redirect("/employee");
        });
    }
    else {
        pool.query("UPDATE employees SET employee=?, birthDay=?, appointmentDay=? where id=?",
            [name, birthDay, appointmentDay, id], function(err, data){
            if(err)
                return console.log(err);
            response.redirect("/employee");
        });
    }
};


//Обработка кнопки и формы отпуска
exports.postHoliday = function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    console.log(request.body);
    const id = parseInt(request.body.id);
    const dateOfHoliday = correct_date(request.body.dateOfHoliday);
    const dateOfEndHoliday = correct_date(request.body.dateOfEndHoliday);
    const causeText = request.body.causeText;
    const kindOfHolidayId = 1;

    pool.query("INSERT INTO holidays(date_from, date_to, causeText, kindOfHolidayId, employeeId) " +
        "VALUES (?,?,?,?,?)", [dateOfHoliday, dateOfEndHoliday, causeText, kindOfHolidayId, id], function(err, data){
        if(err)
            return console.log(err);
        response.redirect("/employee");
    });
};

//Обработка кнопки и формы командировки
exports.postBusinessTrip = function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    console.log(request.body);
    const id = parseInt(request.body.id);
    const dateFrom = correct_date(request.body.dateFrom);
    const dateTo = correct_date(request.body.dateTo);
    const causeText = request.body.causeText;
    const kindOfHolidayId = 2;

    pool.query("INSERT INTO holidays(date_from, date_to, causeText, kindOfHolidayId, employeeId) " +
        "VALUES (?,?,?,?,?)", [dateFrom, dateTo, causeText, kindOfHolidayId, id], function(err, data){
        if(err)
            return console.log(err);
        response.redirect("/employee");
    });
};

//Обработка кнопки и формы больничного
exports.postSickDays = function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    console.log(request.body);
    const id = parseInt(request.body.id);
    const dateFrom = correct_date(request.body.dateFrom);
    const dateTo = correct_date(request.body.dateTo);
    const causeText = request.body.causeText;
    const kindOfHolidayId = 3;

    pool.query("INSERT INTO holidays(date_from, date_to, causeText, kindOfHolidayId, employeeId) " +
        "VALUES (?,?,?,?,?)", [dateFrom, dateTo, causeText, kindOfHolidayId, id], function(err, data){
        if(err)
            return console.log(err);
        response.redirect("/employee");
    });
};

