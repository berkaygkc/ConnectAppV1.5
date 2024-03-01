const catchAsync = require('../utils/catchAsync');
const { listingService } = require('../services');

const getWaitingInvoicesList = catchAsync(async (req, res) => {
  const { db, query } = req;
  const list = await listingService.getWaitingInvoicesList(db, query);
  return res.send(list);
});

const getSendedInvoicesList = catchAsync(async (req, res) => {
  const { db, query } = req;
  const list = await listingService.getSendedInvoicesList(db, query);
  return res.send(list);
});

module.exports = {
  getWaitingInvoicesList,
  getSendedInvoicesList,
};
