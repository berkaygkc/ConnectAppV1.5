const { Worker } = require('bullmq');
const redis = require('../instances/redis.instance');
const config = require('../config/config');
const { invoicesService } = require('../services');
const queues = require('./queues');

const startSendingInvoiceProcessWorker = new Worker(
  'startSendingInvoiceProcess',
  async (job) => {
    const { db, id, serie } = job.data;
    const json = await invoicesService.calculateInvoiceNumberForQueue(db, id, serie);
    await queues.sendInvoiceToIntegratorServiceQueue.add('sendInvoiceToIntegratorService', { db, id, serie });
    return json.sys.external;
  },
  {
    connection: redis,
    concurrency: config.settings.queues.startSendingInvoiceProcess.concurrency,
    removeOnComplete: config.settings.queues.startSendingInvoiceProcess.removeOnComplete,
    removeOnFail: config.settings.queues.startSendingInvoiceProcess.removeOnFail,
  },
);

const sendInvoiceToIntegratorServiceWorker = new Worker(
  'sendInvoiceToIntegratorService',
  async (job) => {
    const { db, id, serie } = job.data;
    const invoice = await invoicesService.sendInvoiceFromDatabase(db, id, serie);
    return invoice;
  },
  {
    connection: redis,
    concurrency: config.settings.queues.sendInvoiceToIntegratorService.concurrency,
    removeOnComplete: config.settings.queues.sendInvoiceToIntegratorService.removeOnComplete,
    removeOnFail: config.settings.queues.sendInvoiceToIntegratorService.removeOnFail,
  },
);

module.exports = {
  startSendingInvoiceProcessWorker,
  sendInvoiceToIntegratorServiceWorker,
};
