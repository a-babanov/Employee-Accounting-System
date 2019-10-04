const express = require('express');
const my_report_cardController = require('../controllers/my_report_cardController.js');
var router = express.Router();

//Маршрут на открытие страницы Мой табель
router.get("/my_report_card", my_report_cardController.getPageMyReportCard);

module.exports = router;