const express = require('express');
const users_loginController = require('../controllers/users_loginController.js');
var router = express.Router();

//Маршрут на открытие страницы регистрации       
router.get("/login", users_loginController.getPageLogin);

//Маршрут на обработку данных формы регистрации
router.post("/login", users_loginController.postLogin);

module.exports = router;