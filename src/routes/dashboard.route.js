const express = require('express');
const { dashboardController } = require('../controllers');
const verifyUser = require('../middlewares/verifyUser');

const router = express.Router();

router.get('/', verifyUser, dashboardController.getDashboardPage);

module.exports = router;
