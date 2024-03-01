const express = require('express');
const { datatablesController } = require('../controllers');
const verifyUser = require('../middlewares/verifyUser');

const router = express.Router();

// Invoices Routers
router.get('/invoices/waiting', verifyUser, datatablesController.getWaitingInvoicesList);
router.get('/invoices/sended', verifyUser, datatablesController.getSendedInvoicesList);

module.exports = router;
