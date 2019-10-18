const KindOfHolidays = require('../models/kindOfHolidayModel.js');
const Employee = require('../models/employeesModel.js');
const Holidays = require('../models/holidaysModel.js');

function correct_date(uncorrect_date) {  //Форматирует дату в виде: "дд-мм-гггг" в вид: "гггг-мм-дд"
    let d = uncorrect_date.slice(0, 2);
    let m = uncorrect_date.slice(3, 5);
    let y = uncorrect_date.slice(6, 10);
    return `${y}-${m}-${d}`;
}

function correct_date2(uncorrect_date) { //Форматирует дату в вид: "дд.мм.гггг"
    let y = uncorrect_date.getFullYear();
    let m = uncorrect_date.getMonth() + 1;
    let d = uncorrect_date.getDate();
    if(m < 10) 
        m = "0" + m;
    if(d < 10)
        d = "0" + d;
    return `${d}.${m}.${y}`;
}

exports.getPageEmployee = async function(request, response){
    if(request.session.userRole !== 0 && !request.session.userLogin) {
        console.log("Вы не авторизованы!");
        return response.redirect(301, "/");
    }   
    
    try {
        const data = await Employee
            .query();

        for(let i=0; i<data.length; i++) {
            data[i]['birthDay'] = correct_date2(new Date(data[i]['birthDay']));
            data[i]['appointmentDay'] = correct_date2(new Date(data[i]['appointmentDay']));
            data[i]['isTerminationDay'] = false;
            
            if(data[i]['terminationDay']) {
                data[i]['isTerminationDay'] = true;     //сотрудник уволен
                data[i]['terminationDay'] = correct_date2(new Date(data[i]['terminationDay']));
            }
        }

        //console.log(data);
        return response.render("employee.hbs", {
            employees: data
        });

    } catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};


//Обработка формы добавления сотрудника
exports.postAddEmployee = async function(request, response){
    if(!request.body)
        return response.sendStatus(400);

    console.log(request.body);
    const name = request.body.employeeName;
    const birthDay = correct_date(request.body.employeeBirthDay);
    const appointmentDay = correct_date(request.body.employeeAppoinmentDay);

    try {
        await Employee
            .query()
            .insert({employee: name, birthDay: birthDay, appointmentDay: appointmentDay});

        response.redirect("/employee");
    }
    catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};

//Обработка формы редактирования сотрудника
exports.postEdit = async function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    
    console.log(request.body);
    const id = request.body.id;
    const name = request.body.employeeName;
    const birthDay = correct_date(request.body.employeeBirthDay);
    const appointmentDay = correct_date(request.body.employeeAppoinmentDay);

    try {
        if(request.body.employeeTerminationDay) {
            const terminationDay = correct_date(request.body.employeeTerminationDay);
            console.log(terminationDay);

            const update = await Employee.query()
                .findById(id)
                .patch({
                    employee: name,
                    birthDay: birthDay,
                    appointmentDay: appointmentDay,
                    terminationDay: terminationDay
                });
            response.redirect("/employee");
        }
        else {
            await Employee.query()
                .findById(id)
                .patch({
                    employee: name,
                    birthDay: birthDay,
                    appointmentDay: appointmentDay,
                });
            response.redirect("/employee");
        }
    } catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};

//Обработка кнопки и формы отпуска
exports.postHoliday = async function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    console.log(request.body);
    const id = parseInt(request.body.id);
    const dateOfHoliday = correct_date(request.body.dateOfHoliday);
    const dateOfEndHoliday = correct_date(request.body.dateOfEndHoliday);
    const causeText = request.body.causeText;
    const kindOfHolidayId = 1;

    try {
        await Holidays.query()
            .insert({
                date_from: dateOfHoliday,
                date_to: dateOfEndHoliday,
                causeText: causeText,
                kindOfHolidayId: kindOfHolidayId,
                employeeId: id
            });

        response.redirect("/employee");
    } catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};

//Обработка кнопки и формы командировки
exports.postBusinessTrip = async function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    console.log(request.body);
    const id = parseInt(request.body.id);
    const dateFrom = correct_date(request.body.dateFrom);
    const dateTo = correct_date(request.body.dateTo);
    const causeText = request.body.causeText;
    const kindOfHolidayId = 2;

    try {
        await Holidays.query()
            .insert({
                date_from: dateFrom,
                date_to: dateTo,
                causeText: causeText,
                kindOfHolidayId: kindOfHolidayId,
                employeeId: id
            });

        response.redirect("/employee");
    } catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};

//Обработка кнопки и формы больничного
exports.postSickDays = async function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    console.log(request.body);
    const id = parseInt(request.body.id);
    const dateFrom = correct_date(request.body.dateFrom);
    const dateTo = correct_date(request.body.dateTo);
    const causeText = request.body.causeText;
    const kindOfHolidayId = 3;

    try {
        const insert = await Holidays.query()
            .insert({
                date_from: dateFrom,
                date_to: dateTo,
                causeText: causeText,
                kindOfHolidayId: kindOfHolidayId,
                employeeId: id
            });
        console.log(insert);
        response.redirect("/employee");
    } catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};

