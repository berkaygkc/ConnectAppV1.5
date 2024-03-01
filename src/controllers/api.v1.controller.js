const catchAsync = require('../utils/catchAsync');
const { invoicesService } = require('../services');

const sendInvoice = catchAsync(async (req, res) => {
  const { db, body } = req;
  const { integrator } = body;
  // const draft = body.draft || true;
  const invoice = await invoicesService.createInvoice(db, encodeURIComponent(req.get('host')), integrator, body);
  // if (!draft) await invoicesService.sendInvoice(db, invoice.id, true);
  return res.send({ status: true, ...invoice });
});

const updateInvoice = catchAsync(async (req, res) => {
  const { db, body } = req;
  const { integrator } = body;
  // const draft = body.draft || true;
  const invoice = await invoicesService.upsertInvoice(db, encodeURIComponent(req.get('host')), integrator, body);
  return res.send({ status: true, ...invoice });
});

const deleteInvoice = catchAsync(async (req, res) => {
  const { db, params } = req;
  await invoicesService.deleteInvoice(db, params.id);
  return res.send({ status: true, detail: 'Başarıyla silindi' });
});

const getInvoiceXML = catchAsync(async (req, res) => {
  const { db, params } = req;
  const xml = await invoicesService.getInvoiceXML(db, params.id);
  return res.header('Content-Type', 'application/xml').send(xml);
});

module.exports = {
  sendInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceXML,
};
