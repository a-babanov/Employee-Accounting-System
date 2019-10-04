const pool = require('../models/connection.js');

var global_Date = 0;  //Дата, выбранная в календаре
const monthNames = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
const colorNames = ['#acd6f5', '#81ff51', '#f56f37', '#f53931', '#acabac'];

//Контроллёр на открытие главной страницы
exports.getIndex = function(request, response){
    if(request.session.userRole == 0 && request.session.userLogin) {
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
        pool.query("SELECT id, employee from employees WHERE terminationDay is NULL", function(err, data1) {
            if(err)
                return console.log(err);
            //console.log("data1: ");
            //console.log(data1);
            data = data1;
            pool.query(`SELECT id, timeOfArrival, numberOfHours, employeeId, isExcused, comment from timeSheet ` +
                `where currentDay = '${curDate}'`, function(err, data2) {
                if(err)
                    return console.log(err);
                //console.log("data2: ");
                //console.log(data2);
                for (let i = 0; i<data2.length; i++) {
                    for (let j=0; j<data.length; j++) {
                        if(data2[i]['employeeId'] == data[j]['id']) {
                            data[j]['timeOfArrival'] = data2[i]['timeOfArrival'];
                            data[j]['numberOfHours'] = data2[i]['numberOfHours'];
                            data[j]['employeeId'] = data2[i]['employeeId'];
                            data[j]['timesheetId'] = data2[i]['id'];
                            data[j]['comment'] = data2[i]['comment'];
                        }
                    }
                }
                for (let j=0; j<data.length; j++) {
                    data[j]['color'] = colorNames[0];           //по умолчанию строка подсвечивается в голубой цвет
                }
                for (let i = 0; i<data2.length; i++) {
                    for (let j=0; j<data.length; j++) {
                        if(data2[i]['isExcused'] && data2[i]['employeeId'] == data[j]['id']){       //Если сотрудник отпросился,
                            data[j]['color'] = colorNames[4];   //закрасить его строку в серый цвет
                        }
                    }
                }
                pool.query(`SELECT * from holidays WHERE '${curDate}' BETWEEN date_from and date_to`, function(err, data3) {
                    if(err)
                        return console.log(err);
                    //console.log("data3: ");
                    //console.log(data3);
                    for (let i = 0; i<data3.length; i++) {
                        for (let j=0; j<data.length; j++) {
                            if(data3[i]['employeeId'] == data[j]['id']) {           //Если сотрудник в отпуске, командировке, на больничном,
                                data[j]['color'] = colorNames[data3[i]['kindOfHolidayId']];  //закрасить его строку в соответсвующий цвет
                            }
                        }
                    }
                    pool.query(`SELECT * from meeting WHERE currentDay = '${curDate}' ` +
                        `and '${curTime}' BETWEEN timeFrom and timeTo`, function(err, data4) {
                        if(err)
                            return console.log(err);
                        for (let i = 0; i<data4.length; i++) {
                            for (let j=0; j<data.length; j++) {
                                if(data4[i]['timesheetId'] == data[j]['timesheetId']) {
                                    data[j]['color'] = colorNames[4];
                                }
                            }
                        }
                        //console.log("data4: ");
                        //console.log(data4);
                        //console.log(data);

                        pool.query(`SELECT * from meeting WHERE currentDay = '${curDate}'`, function(err, data5){
                            if(err)
                                return console.log(err);
                            for (let j=0; j<data.length; j++) {
                                data[j]['causeText'] = {};
                            }
                            for (let i = 0; i<data5.length; i++) {
                                for (let j=0; j<data.length; j++) {
                                    if(data5[i]['timesheetId'] == data[j]['timesheetId']) {
                                        data[j]['causeText']['next' + i] = data5[i]['causeText'];
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
                            //console.log(data5);
                            //console.log(data);
                            return response.render("index.hbs", {
                                employees: data,
                                formatDate : formatDate
                            });
                        });
                    });
                });
            });
        });
    } 
    else {
        console.log("Вы не авторизованы!");
        response.redirect(301, "/");
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
exports.postSave = function(request, response) {
    if(!request.body)
        return response.sendStatus(400);
    let timeOfArrival = request.body.timeOfArrival;
    let numberOfHours = "";
    
    //if(request.body.numberOfHours && request.body.numberOfHours !== "00:00") {
        //numberOfHours = request.body.numberOfHours;
    //}
    //else {
        let timeToLeave = "18:00";   //Конец рабочего дня по умолчанию
        let time_to_leave = getCorrectTime(timeToLeave); //Время ухода сотрудников
        let time_of_arrival = getCorrectTime(timeOfArrival);  //Время прихода сотрудников
        let number_of_hours = new Date(time_to_leave.getTime() - time_of_arrival.getTime());  //Разница между временем прихода и ухода

        numberOfHours = `${number_of_hours.getUTCHours() - 1}:${number_of_hours.getUTCMinutes()}`; //Количество отработанных часов
        timeOfArrival = `${time_of_arrival.getUTCHours()}:${time_of_arrival.getUTCMinutes()}`;

        console.log(timeOfArrival);
        console.log(numberOfHours);
    //}

    const employeeId = request.params.employeeId;

    if(global_Date)
        var date = new Date(global_Date);
    else var date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let curDate = `${y}-${m}-${d}`;   //Выбранная в календаре дата

    console.log("\n\tbegin");
    console.log(curDate);
    console.log(request.body);

    pool.query(`SELECT id, employeeId from timeSheet WHERE currentDay = '${curDate}' and employeeId = '${employeeId}'`, function(err, data) {
        if(err)
            return console.log(err);

        console.log(data[0]);
        if(data[0]) {
            console.log("\tupdate timesheet: ");
            let global_id = parseInt(data[0]['id']);
            console.log("global_id: " + global_id);
            pool.query("UPDATE timeSheet SET currentDay=?, timeOfArrival=?, numberOfHours=?, employeeId=? " +
                "WHERE id=?", [curDate, timeOfArrival, numberOfHours, employeeId, global_id], function(err, data){
                if(err)
                    return console.log(err);
                response.redirect(301, "/index");
            });
        }
        else {
            pool.query("INSERT INTO timeSheet(currentDay, timeOfArrival, numberOfHours, employeeId)" +
                "VALUES (?,?,?,?)", [curDate, timeOfArrival, numberOfHours, employeeId], function(err, data) {
                if(err)
                    return console.log(err);
                response.redirect(301, "/index");
            });
        }
    });
};


//Обработка формы отпросился
exports.postGetAway = function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    const causeText = request.body.getAwayComment;
    const employeeId = request.params.employeeId;

    if(global_Date)
        var date = new Date(global_Date);
    else var date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let curDate = `${y}-${m}-${d}`;

    console.log("\nbegin Отпросился: ");
    console.log(curDate);
    console.log(request.body);

    pool.query(`SELECT * from timeSheet WHERE currentDay = '${curDate}' and employeeId = '${employeeId}'`, function(err, data) {
        if(err)
            return console.log(err);
        console.log(data[0]);
        if(data[0]) {
            let timeSheet_id = parseInt(data[0]['id']);
            let timeOfArrival = data[0]['timeOfArrival'];
            let numberOfHours = data[0]['numberOfHours'];
            console.log("timeSheet_id: " + timeSheet_id);
            console.log("timeOfArrival: " + timeOfArrival);
            console.log("numberOfHours: " + numberOfHours);
            pool.query("UPDATE timeSheet SET currentDay=?, timeOfArrival=?, numberOfHours=?, employeeId=?, " +
                "isExcused=?, comment=? WHERE id=?",
                [curDate, timeOfArrival, numberOfHours, employeeId, true, causeText, timeSheet_id],
                function(err, data){
                    if(err)
                        return console.log(err);
                    response.redirect(301, "/index");
                });
        }
        else {
            pool.query("INSERT INTO timeSheet(currentDay, employeeId, isExcused, comment)" +
                "VALUES (?,?,?,?)", [curDate, employeeId, 1, causeText], function(err, data) {
                if(err)
                    return console.log(err);
                response.redirect(301, "/index");
            });
        }
    });
};

//Обработка формы встречи
exports.postMeeting = function(request, response){
    if(!request.body)
        return response.sendStatus(400);
    console.log(request.body);
    const timeFrom = request.body.meeting_timeFrom;
    const timeTo = request.body.meeting_timeTo;
    var causeText = request.body.meetingComment;
    const employeeId = request.params.employeeId;

    if(global_Date)
        var date = new Date(global_Date);
    else var date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let curDate = `${y}-${m}-${d}`;

    pool.query(`SELECT id, employeeId from timeSheet WHERE currentDay = '${curDate}' and employeeId = '${employeeId}'`, function(err, data) {
        if(err)
            return console.log(err);
        console.log(data[0]);
        if(data[0]) {
            let timeSheet_id = parseInt(data[0]['id']);
            console.log("timeSheet_id: " + timeSheet_id);
            pool.query("INSERT INTO meeting(currentDay, timeFrom, timeTo, causeText, timesheetId) " +
                "VALUES (?,?,?,?,?)", [curDate, timeFrom, timeTo, causeText, timeSheet_id], function(err, data){
                if(err)
                    return console.log(err);
                response.redirect("/index");
            });
        }
        else {
            pool.query("INSERT INTO timeSheet(currentDay, employeeId)" +
                "VALUES (?,?)", [curDate, employeeId], function(err, data) {
                if(err)
                    return console.log(err);
                pool.query(`SELECT id, employeeId from timeSheet WHERE currentDay = '${curDate}' and employeeId = '${employeeId}'`, function(err, data) {
                    if (err)
                        return console.log(err);
                    let timeSheet_id = parseInt(data[0]['id']);
                    console.log("timeSheet_id: " + timeSheet_id);

                    pool.query("INSERT INTO meeting(currentDay, timeFrom, timeTo, causeText, timesheetId) " +
                        "VALUES (?,?,?,?,?)", [curDate, timeFrom, timeTo, causeText, timeSheet_id], function(err, data){
                        if(err)
                            return console.log(err);
                        response.redirect("/index");
                    });
                });
            });
        }
    });
};
