const Joi = require('@hapi/joi');

const KindOfHolidays = require('../models/kindOfHolidayModel.js');
const Employee = require('../models/employeesModel.js');
const Holidays = require('../models/holidaysModel.js');

const schema = Joi.object({
    validate_id: Joi.number(),

    validate_name: Joi.string(),

    validate_date: Joi.string()
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
    //Валидируем данные и сохраняем в объекты
    const validateName = await schema.validateAsync({validate_name: request.body.employeeName});
    const validateBirthDay = await schema.validateAsync({validate_date: request.body.employeeBirthDay});
    const validateAppointmentDay = await schema.validateAsync({validate_date: request.body.employeeAppoinmentDay});

    const name = validateName.validate_name;
    const birthDay = correct_date(validateBirthDay.validate_date);
    const appointmentDay = correct_date(validateAppointmentDay.validate_date);


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
        //Валидируем данные и сохраняем в объекты
        const validateId = await schema.validateAsync({ validate_id: request.body.id });
        const validateName = await schema.validateAsync({ validate_name: request.body.employeeName });
        const validateBirthDay = await schema.validateAsync({ validate_date: request.body.employeeBirthDay });
        const validateAppointmentDay = await schema.validateAsync({ validate_date: request.body.employeeAppoinmentDay });    

        const id = validateId.validate_id;
        const name = validateName.validate_name;
        const birthDay = correct_date(validateBirthDay.validate_date);
        const appointmentDay = correct_date(validateAppointmentDay.validate_date);

        if(request.body.employeeTerminationDay) {
            const validateTerminationDay = await schema.validateAsync({ validate_date: request.body.employeeTerminationDay });
            const terminationDay = correct_date(validateTerminationDay.validate_date);
            console.log(terminationDay);

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
        console.log(request.body);

        //Валидируем данные и сохраняем в объекты
        const validateId = await schema.validateAsync({validate_id: request.body.id});
        const validateDateOfHoliday = await schema.validateAsync({ validate_date: request.body.dateOfHoliday });
        const validateDateOfEndHoliday = await schema.validateAsync({ validate_date: request.body.dateOfEndHoliday });
        const validateCauseText = await schema.validateAsync({ validate_name: request.body.causeText });    

        const id = validateId.validate_id;
        const dateOfHoliday = correct_date(validateDateOfHoliday.validate_date);
        const dateOfEndHoliday = correct_date(validateDateOfEndHoliday.validate_date);
        const causeText = validateCauseText.validate_name;
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
        //Валидируем данные и сохраняем в объекты
        const validateId = await schema.validateAsync({validate_id: request.body.id});
        const validateDateFrom = await schema.validateAsync({ validate_date: request.body.dateFrom });
        const validateDateTo = await schema.validateAsync({ validate_date: request.body.dateTo });
        const validateCauseText = await schema.validateAsync({ validate_name: request.body.causeText });    

        const id = validateId.validate_id;
        const dateFrom = correct_date(validateDateFrom.validate_date);
        const dateTo = correct_date(validateDateTo.validate_date);
        const causeText = validateCauseText.validate_name;
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
        //Валидируем данные и сохраняем в объекты
        const validateId = await schema.validateAsync({validate_id: request.body.id});
        const validateDateFrom = await schema.validateAsync({ validate_date: request.body.dateFrom });
        const validateDateTo = await schema.validateAsync({ validate_date: request.body.dateTo });
        const validateCauseText = await schema.validateAsync({ validate_name: request.body.causeText });    

        const id = validateId.validate_id;
        const dateFrom = correct_date(validateDateFrom.validate_date);
        const dateTo = correct_date(validateDateTo.validate_date);
        const causeText = validateCauseText.validate_name;
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

