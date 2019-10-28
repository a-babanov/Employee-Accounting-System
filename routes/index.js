const express = require('express');
const indexController = require('../controllers/indexController.js');
const router = express.Router();


//Маршрут на получение главной страницы 
router.get("/index", indexController.getIndex);

//Маршрут на обработку запроса обновления даты
router.post("/index", indexController.postUpdateDate);

router.post('/save', indexController.postSave);

//Маршрут на обработку формы отпросился
router.post("/getAway", indexController.postGetAway);

//Маршрут на обработку запроса формы встречи
router.post("/meeting", indexController.postMeeting);

module.exports = router;
