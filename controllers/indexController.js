const Joi = require('@hapi/joi');

const KindOfHolidays = require('../models/kindOfHolidayModel.js');
const Holidays = require('../models/holidaysModel.js');
const Employee = require('../models/employeesModel.js');
const Meeting = require('../models/meetingModel.js');
const TimeSheet = require('../models/timesheetModel.js');

const schema = Joi.object({
    validate_int: Joi.number(),

    validate_string: Joi.string(),

    validate_time: Joi.string()
        .pattern(/^(\d\d?):(\d\d?)$/)
});

var global_Date = 0;  //Дата, выбранная в календаре
const monthNames = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
const colorNames = ['#acd6f5', '#81ff51', '#f56f37', '#f53931', '#acabac'];

//Контроллёр на открытие главной страницы
exports.getIndex = async function(request, response){
    if(request.session.userRole !== 0 && !request.session.userLogin) {
        console.log("Вы не авторизованы!");
        return response.redirect(301, "/");
    }

    if(global_Date)
        var date = new Date(global_Date);
    else var date = new Date();
        
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let hh = new Date().getHours();
    let mm = new Date().getUTCMinutes();
    let curDate = `${y}-${m}-${d}`;
    let curTime = `${hh}:${mm}`;
    let formatDate = `${d} ${monthNames[m-1]} ${y}`;

    //console.log(new Date(global_Date));
    //console.log(curDate);
    //console.log(curTime);
    let data = {};

    try {
        const select1 = await Employee.query()
            .select('id', 'employee')
            .where('terminationDay', null);
            data = select1;

        const select2 = await TimeSheet.query()
            .where('currentDay', curDate);
            for (let i = 0; i<select2.length; i++) {
                for (let j=0; j<data.length; j++) {
                    if(select2[i]['employeeId'] == data[j]['id']) {
                        data[j]['timeOfArrival'] = select2[i]['timeOfArrival'];
                        data[j]['numberOfHours'] = select2[i]['numberOfHours'];
                        data[j]['employeeId'] = select2[i]['employeeId'];
                        data[j]['timesheetId'] = select2[i]['id'];
                        data[j]['comment'] = select2[i]['comment'];
                    }
                }
            }
            for (let j=0; j<data.length; j++) {
                data[j]['color'] = colorNames[0];           //по умолчанию строка подсвечивается в голубой цвет
            }
            for (let i = 0; i<select2.length; i++) {
                for (let j=0; j<data.length; j++) {
                    if(select2[i]['isExcused'] && select2[i]['employeeId'] == data[j]['id']){       //Если сотрудник отпросился,
                        data[j]['color'] = colorNames[4];   //закрасить его строку в серый цвет
                    }
                }
            }

        const select3 = await Holidays.query()
            .where('date_from', '<=', curDate)
            .where('date_to', '>=', curDate);

            for (let i = 0; i<select3.length; i++) {
                for (let j=0; j<data.length; j++) {
                    if(select3[i]['employeeId'] == data[j]['id']) {           //Если сотрудник в отпуске, командировке, на больничном,
                        data[j]['color'] = colorNames[select3[i]['kindOfHolidayId']];  //закрасить его строку в соответсвующий цвет
                    }
                }
            }
            //console.log("select3: ");
            //console.log(select3);
        
        const select4 = await Meeting.query()
            .where('currentDay', curDate)
            .where('timeFrom', '<=', curTime)
            .where('timeTo', '>=', curTime);

            for (let i = 0; i<select4.length; i++) {
                for (let j=0; j<data.length; j++) {
                    if(select4[i]['timesheetId'] == data[j]['timesheetId']) {
                        data[j]['color'] = colorNames[4];
                    }
                }
            }

            //console.log("select4: ");
            //console.log(select4);

        const select5 = await Meeting.query()
            .where('currentDay', curDate);

            for (let j=0; j<data.length; j++) {
                data[j]['causeText'] = {};
            }
            for (let i = 0; i<select5.length; i++) {
                for (let j=0; j<data.length; j++) {
                    if(select5[i]['timesheetId'] == data[j]['timesheetId']) {
                        data[j]['causeText']['next' + i] = select5[i]['causeText'];
                    }
                }
            }
            for (let i = 0; i<data.length-1; i++) { //сортировка сотрудников в алфавитном порядке
                for (let j = i+1; j<data.length; j++) {
                    if (data[i]['employee'] > data[j]['employee']) {
                        var tmp = data[i];
                        data[i] = data[j];
                        data[j] = tmp;
                    }
                }
            }
            for (let i = 0; i<data.length; i++) {
                data[i]['order'] = i+1;
            }
            //console.log(select5);  

        //console.log(data);
         
        return response.render("index.hbs", {
            employees: data,
            formatDate : formatDate
        });
    } catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};


//Обработка запроса обновления даты
exports.postUpdateDate = function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    global_Date = request.body.n_date;
};

function getCorrectTime(time){
    let hh = time.slice(0, 2);
    let mm = time.slice(3, 5);
    let rez = hh*3600000 + mm*60000;  //Количество милисекунд
    return new Date(rez);
}

//Обработка запроса кнопки сохранить
exports.postSave = async function(request, response) {
    if(!request.body)
        return response.sendStatus(400);

    if(global_Date)
        var date = new Date(global_Date);
    else var date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let curDate = `${y}-${m}-${d}`;   //Выбранная в календаре дата

    console.log(request.body);    
    try {
        //Валидируем данные и сохраняем в объекты
        const validateEmployeeId = schema.validate({validate_int: +request.body.employeeId});
        const validateTimeOfArrival = schema.validate({validate_time: request.body.timeOfArrival});
        console.log(validateEmployeeId);
        console.log(validateTimeOfArrival);

        var employeeId = validateEmployeeId.value.validate_int;
        var timeOfArrival = validateTimeOfArrival.value.validate_time;

        //Получаем количество отработанных часов
        let timeToLeave = "18:00";   //Конец рабочего дня по умолчанию
        let time_to_leave = getCorrectTime(timeToLeave); //Время ухода сотрудников
        let time_of_arrival = getCorrectTime(timeOfArrival);  //Время прихода сотрудников
        let number_of_hours = new Date(time_to_leave.getTime() - time_of_arrival.getTime());  //Разница между временем прихода и ухода
        var numberOfHours = `${number_of_hours.getUTCHours() - 1}:${number_of_hours.getUTCMinutes()}`; //Количество отработанных часов

        console.log(employeeId);
        console.log(timeOfArrival);
        console.log(numberOfHours); 
    } catch(err) {
        console.log("error");
        console.log(err);

        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error');
    }

    try {
        const select = await TimeSheet.query()
            .select('id', 'employeeId')
            .where('currentDay', curDate)
            .where('employeeId', "" + employeeId);

            console.log("\n\tselect:");
            console.log(select);
            

        if(select[0]) {
            console.log("\tupdate timesheet: ");
            let global_id = parseInt(select[0]['id']);
            console.log("global_id: " + global_id);

            const update = await TimeSheet.query()
                .findById(global_id)
                .patch({
                    currentDay: curDate,
                    timeOfArrival: timeOfArrival,
                    numberOfHours: numberOfHours,
                    employeeId: employeeId
                });
                console.log("update: ");
                console.log(update);
            return response.redirect("/index");
        } 
        else {
            const insert = await TimeSheet.query()
                .insert({
                    currentDay: curDate,
                    timeOfArrival: timeOfArrival,
                    numberOfHours: numberOfHours,
                    employeeId: employeeId
                });
                console.log("insert: ");
                console.log(insert);

            return response.redirect("/index");
        } 

    } catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};

//Обработка формы отпросился
exports.postGetAway = async function(request, response){
    if(!request.body)
        return response.sendStatus(400);

    if(global_Date)
        var date = new Date(global_Date);
    else var date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let curDate = `${y}-${m}-${d}`;

    try {
        console.log("\nbegin Отпросился: ");
        console.log(request.body);

        //Валидируем данные и сохраняем в объекты
        const validateEmployeeId = schema.validate({validate_int: request.body.id});
        const validateCauseText = schema.validate({validate_string: request.body.getAwayComment});

        const employeeId = validateEmployeeId.value.validate_int;
        const causeText = validateCauseText.value.validate_string;

        const select = await TimeSheet.query()
            .where('currentDay', curDate)
            .where('employeeId', employeeId);
            console.log(select[0]);

        if(select[0]) {
            let timeSheet_id = parseInt(select[0]['id']);
            let timeOfArrival = select[0]['timeOfArrival'];
            let numberOfHours = select[0]['numberOfHours'];
            console.log("timeSheet_id: " + timeSheet_id);
            console.log("timeOfArrival: " + timeOfArrival);
            console.log("numberOfHours: " + numberOfHours);

            const update = await TimeSheet.query()
                .findById(timeSheet_id)
                .patch({
                    currentDay: curDate,
                    timeOfArrival: timeOfArrival,
                    numberOfHours: numberOfHours,
                    employeeId: employeeId,
                    isExcused: true,
                    comment: causeText
                });
            return response.redirect(301, "/index");
        }
        else {
            const insert = await TimeSheet.query()
                .insert({
                    currentDay: curDate,
                    employeeId: employeeId,
                    isExcused: 1,
                    comment: causeText
                });
            return response.redirect(301, "/index");
        }

    } catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};


//Обработка формы встречи
exports.postMeeting = async function(request, response){
    if(!request.body)
        return response.sendStatus(400);

    if(global_Date)
        var date = new Date(global_Date);
    else var date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let curDate = `${y}-${m}-${d}`;

    try {
        //Валидируем данные и сохраняем в объекты
        const validateEmployeeId = schema.validate({validate_int: request.body.id});
        const validateTimeFrom = schema.validate({validate_time: request.body.meeting_timeFrom});
        const validateTimeTo = schema.validate({validate_time: request.body.meeting_timeTo});
        const validateCauseText = schema.validate({validate_string: request.body.meetingComment});

        console.log(request.body);
        const employeeId = validateEmployeeId.value.validate_int;
        const timeFrom = validateTimeFrom.value.validate_time;
        const timeTo = validateTimeTo.value.validate_time;
        const causeText = validateCauseText.value.validate_string;

        const select = await TimeSheet.query()
            .select('id', 'employeeId')
            .where('currentDay', curDate)
            .where('employeeId', employeeId);
            console.log(select[0]);

        if(select[0]) {
            let timeSheet_id = parseInt(select[0]['id']);
            console.log("timeSheet_id: " + timeSheet_id);
            const insert = await Meeting.query()
                .insert({
                    currentDay: curDate,
                    timeFrom: timeFrom,
                    timeTo: timeTo,
                    causeText: causeText,
                    timesheetId: timeSheet_id
                });
            return response.redirect("/index");
        }
        else {
            const insert2 = await TimeSheet.query()
                .insert({
                    currentDay: curDate,
                    employeeId: employeeId
                });
                console.log(insert2['id']);

            let timeSheet_id = parseInt(insert2['id']);
            console.log("timeSheet_id: " + timeSheet_id);

            await Meeting.query()
                .insert({
                    currentDay: curDate,
                    timeFrom: timeFrom,
                    timeTo: timeTo,
                    causeText: causeText,
                    timesheetId: timeSheet_id
                });
            return response.redirect("/index");
        }
    } catch(err) {
        response.locals.message = err.message;
        response.locals.error = request.app.get('env') === 'development' ? err : {};

        // render the error page
        response.status(err.status || 500);
        return response.render('error.hbs');
    }
};
