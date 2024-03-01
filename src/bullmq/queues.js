const { Queue } = require('bullmq');
const redis = require('../instances/redis.instance');

const startSendingInvoiceProcessQueue = new Queue('startSendingInvoiceProcess', {
  connection: redis,
});

const sendInvoiceToIntegratorServiceQueue = new Queue('sendInvoiceToIntegratorService', {
  connection: redis,
});

module.exports = {
  startSendingInvoiceProcessQueue,
  sendInvoiceToIntegratorServiceQueue,
};
