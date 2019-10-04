const express = require('express');
const all_report_cardsController = require('../controllers/all_report_cardsController.js');
var router = express.Router();

//Маршрут на получение страницы Все табели
router.get("/all_report_cards", all_report_cardsController.getPageAllReportCards);

module.exports = router;