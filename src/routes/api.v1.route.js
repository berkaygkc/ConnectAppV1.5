const express = require('express');
const { apiV1Controller } = require('../controllers');
// const verifyUser = require('../middlewares/verifyUser');
const verifyExternal = require('../middlewares/verifyExternal');

const router = express.Router();

// Invoices Routers
router.post('/external/invoices', verifyExternal, apiV1Controller.sendInvoice);
router.put('/external/invoices', verifyExternal, apiV1Controller.updateInvoice);
router.put('/external/invoices/:id', verifyExternal, apiV1Controller.deleteInvoice);
router.get('/external/invoices/:id/xml', verifyExternal, apiV1Controller.getInvoiceXML);

module.exports = router;
