const catchAsync = require('../utils/catchAsync');
const { startSendingInvoiceProcessQueue } = require('../bullmq/queues');
const { invoicesService } = require('../services');

const getWaitingPage = catchAsync((req, res) => {
  return res.render('pages/invoices/waiting', {
    page: {
      name: 'invoices-waiting',
      display: 'Taslak Faturalar',
      menu: 'waiting',
      uppermenu: 'documents',
    },
  });
});

const getSendedPage = catchAsync((req, res) => {
  return res.render('pages/invoices/sended', {
    page: {
      name: 'invoices-sended',
      display: 'Gönderilmiş Faturalar',
      menu: 'sended',
      uppermenu: 'documents',
    },
  });
});

const addInvoice = catchAsync(async (req, res) => {
  const { db, integrator, body } = req;
  const invoice = await invoicesService.createInvoice(db, encodeURIComponent(req.get('host')), integrator, body);
  return res.send(invoice);
});

const sendInvoice = catchAsync(async (req, res) => {
  const { db, params, query } = req;
  const { id } = params;
  const { serie } = query;
  const job = await startSendingInvoiceProcessQueue.add('startSendingInvoiceProcess', { db, id, serie });
  await invoicesService.setQueuedStatusForInvoice(db, id, job.id);
  return res.send({ status: true, message: 'Fatura başarıyla kuyruğa eklendi.', job: job.id });
});

const refreshInvoice = catchAsync(async (req, res) => {
  const { db, params } = req;
  const { id } = params;
  const invoice = await invoicesService.refreshInvoice(db, id);
  return res.send(invoice);
});

const getInvoiceXML = catchAsync(async (req, res) => {
  const { db, params } = req;
  const { id } = params;
  const xml = await invoicesService.getInvoiceXML(db, id);
  return res.header('Content-Type', 'text/xml').send(xml);
});

const getInvoiceXSLT = catchAsync(async (req, res) => {
  const { db, params } = req;
  const { id } = params;
  const xslt = await invoicesService.getInvoiceXSLT(db, id);
  return res.header('Content-Type', 'text/xml').send(xslt);
});

const getInvoiceBarcode = catchAsync(async (req, res) => {
  const { db, params } = req;
  const { id } = params;
  const barcode = await invoicesService.getInvoiceBarcode(db, id);
  return res.send(barcode);
});

const markAsSended = catchAsync(async (req, res) => {
  const { db, params } = req;
  const { id } = params;
  await invoicesService.markSendStatus(db, id, true);
  return res.send(true);
});

module.exports = {
  getWaitingPage,
  getSendedPage,
  addInvoice,
  sendInvoice,
  refreshInvoice,
  getInvoiceXML,
  getInvoiceXSLT,
  getInvoiceBarcode,
  markAsSended,
};
