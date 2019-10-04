const express = require('express');
const users_sign_inController = require('../controllers/users_sign_inController.js');
var router = express.Router();

//Маршрут на открытие страницы авторизации
router.get("/", users_sign_inController.getPageSignIn);

//Маршрут на обработку данных формы авторизации
router.post("/", users_sign_inController.postSignIn);

module.exports = router;