const express = require('express');

const apiV1Route = require('./api.v1.route');

const dashboardRoute = require('./dashboard.route');
const accountRoute = require('./account.route');
const invoicesRoute = require('./invoices.route');
const datatablesRoute = require('./datatables.route');
const adminRoute = require('./admin.route');

const router = express.Router();

router.use('/api/v1.0', apiV1Route);

router.use('/account', accountRoute);
router.use('/datatablesQuery', datatablesRoute);

router.use('/', dashboardRoute);
router.use('/invoices', invoicesRoute);

router.use('/admin', adminRoute);

module.exports = router;
