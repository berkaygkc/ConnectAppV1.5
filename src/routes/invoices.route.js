const express = require('express');
const { invoicesController } = require('../controllers');
const verifyUser = require('../middlewares/verifyUser');

const router = express.Router();

// Waiting Routers
router.get('/waiting', verifyUser, invoicesController.getWaitingPage);
router.post('/waiting', verifyUser, invoicesController.addInvoice);
router.patch('/waiting/:id', verifyUser, invoicesController.refreshInvoice);
router.post('/waiting/:id', verifyUser, invoicesController.sendInvoice);
router.get('/waiting/:id/xml', verifyUser, invoicesController.getInvoiceXML);
router.get('/waiting/:id/xslt', verifyUser, invoicesController.getInvoiceXSLT);
router.get('/waiting/:id/barcode', verifyUser, invoicesController.getInvoiceBarcode);
router.put('/waiting/:id/mark/send', verifyUser, invoicesController.markAsSended);

// Sended Routers
router.get('/sended', verifyUser, invoicesController.getSendedPage);

module.exports = router;
