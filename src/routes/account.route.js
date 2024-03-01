const express = require('express');
const { accountController } = require('../controllers');
const setAppInfo = require('../middlewares/setAppInfo');
const verifyUser = require('../middlewares/verifyUser');

const router = express.Router();

router.get('/login', setAppInfo, accountController.login);
router.get('/logout', verifyUser, accountController.logout);

module.exports = router;
