const Joi = require('@hapi/joi');

const KindOfHolidays = require('../models/kindOfHolidayModel.js');
const Employee = require('../models/employeesModel.js');
const Holidays = require('../models/holidaysModel.js');

const schema = Joi.object({
    id: Joi.number(),
    name: Joi.string(),
    birthday: Joi.string()
        .pattern(/^(\d\d?)\-(\d\d?)\-(\d{4})$/),

    appointmentDay: Joi.string()
        .pattern(/^(\d\d?)\-(\d\d?)\-(\d{4})$/),

    terminationDay: Joi.string()
        .pattern(/^(\d\d?)\-(\d\d?)\-(\d{4})$/),


    causeText: Joi.string(),
    dateFrom: Joi.string()
        .pattern(/^(\d\d?)\-(\d\d?)\-(\d{4})$/),

    dateTo: Joi.string()
        .pattern(/^(\d\d?)\-(\d\d?)\-(\d{4})$/)
});

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

    try {
        //Валидируем данные и сохраняем в объект
        const body = await schema.validateAsync({
            name: request.body.employeeName,
            birthday: request.body.employeeBirthDay,
            appointmentDay: request.body.employeeAppoinmentDay
        });

        console.log(request.body);
        console.log(body);
        const name = body.name;
        const birthDay = correct_date(body.birthday);
        const appointmentDay = correct_date(body.appointmentDay);

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

    try {
        //Валидируем данные и сохраняем в объект
        const body = await schema.validateAsync({
            id: request.body.id,
            name: request.body.employeeName,
            birthday: request.body.employeeBirthDay,
            appointmentDay: request.body.employeeAppoinmentDay,
        });
        
        console.log(request.body);
        console.log("\tbody: ");
        console.log(body);

        const id = body.id;
        const name = body.name;
        const birthDay = correct_date(body.birthday);
        const appointmentDay = correct_date(body.appointmentDay);

        if(request.body.employeeTerminationDay) {
            const body2 = await schema.validateAsync({
                terminationDay: request.body.employeeTerminationDay
            });
            console.log(body2);
            const terminationDay = correct_date(body2.terminationDay);

            const update = await Employee.query()
                .findById(id)
                .patch({
                    employee: name,
                    birthDay: birthDay,
                    appointmentDay: appointmentDay,
                    terminationDay: terminationDay
                });


                console.log(update);
            response.redirect("/employee");
        }
        else {
            const update2 = await Employee.query()
                .findById(id)
                .patch({
                    employee: name,
                    birthDay: birthDay,
                    appointmentDay: appointmentDay,
                });
            response.redirect("/employee");

            console.log(update2);
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
    
    try {
        //Валидируем данные и сохраняем в объект
        const body = await schema.validateAsync({
            id: request.body.id,
            dateFrom: request.body.dateOfHoliday,
            dateTo: request.body.dateOfEndHoliday,
            causeText: request.body.causeText
        });

        console.log(request.body);
        console.log("\tbody: ");
        console.log(body);

        const id = body.id;
        const dateOfHoliday = correct_date(body.dateFrom);
        const dateOfEndHoliday = correct_date(body.dateTo);
        const causeText = body.causeText;
        const kindOfHolidayId = 1;

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

    try {
        //Валидируем данные и сохраняем в объект
        const body = await schema.validateAsync({
            id: request.body.id,
            dateFrom: request.body.dateFrom,
            dateTo: request.body.dateTo,
            causeText: request.body.causeText
        });
        
        console.log(request.body);
        console.log("\tbody: ");
        console.log(body);

        const id = body.id;
        const dateFrom = correct_date(body.dateFrom);
        const dateTo = correct_date(body.dateTo);
        const causeText = body.causeText;
        const kindOfHolidayId = 2;

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
    
    try {
        //Валидируем данные и сохраняем в объект
        const body = await schema.validateAsync({
            id: request.body.id,
            dateFrom: request.body.dateFrom,
            dateTo: request.body.dateTo,
            causeText: request.body.causeText
        });

        console.log(request.body);
        console.log("\tbody: ");
        console.log(body);

        const id = body.id;
        const dateFrom = correct_date(body.dateFrom);
        const dateTo = correct_date(body.dateTo);
        const causeText = body.causeText;
        const kindOfHolidayId = 3;

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

