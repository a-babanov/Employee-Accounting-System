const express = require('express');
const reportsController = require('../controllers/reportsController.js');
var router = express.Router();

//Маршрут на открытие страницы Отчёты
router.get("/reports", reportsController.getPageReports);

module.exports = router;