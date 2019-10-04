var express = require('express');
const logoutController = require('../controllers/logoutController.js');
var router = express.Router();

router.get("/logout", logoutController.getLogout);

module.exports = router;