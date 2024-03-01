const express = require('express');
const bullBoard = require('../bullmq/board');
const verifyUser = require('../middlewares/verifyUser');

const router = express.Router();

router.use('/bull-board', verifyUser, bullBoard.getRouter());

module.exports = router;
