const express = require('express');
const employeeController = require('../controllers/employeeController.js');
var router = express.Router();

//Маршрут на получение страницы сотрудники
router.get("/employee", employeeController.getPageEmployee);

//Маршрут на обработку запроса добавления сотрудника
router.post("/employee", employeeController.postAddEmployee);

//Маршрут на обработку формы редактирования сотрудника
router.post("/employee/edit", employeeController.postEdit);

//Маршрут на обработку формы отпуска
router.post("/employee/holiday", employeeController.postHoliday);

//Маршрут на обработку формы командировки
router.post("/employee/businessTrip", employeeController.postBusinessTrip);

//Маршрут на обработку формы больничного
router.post("/employee/sickDays", employeeController.postSickDays);

module.exports = router;