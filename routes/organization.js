const express = require('express');
const organizationController = require('../controllers/organizationController.js');
var router = express.Router();

//Маршрут на открытие страницы Об учреждении
router.get("/tuning/organization", organizationController.getPageOrganization);

module.exports = router; 