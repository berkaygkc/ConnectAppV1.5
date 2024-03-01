const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const queues = require('./queues');
require('./workers');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/bull-board');
createBullBoard({
  queues: [
    new BullMQAdapter(queues.startSendingInvoiceProcessQueue),
    new BullMQAdapter(queues.sendInvoiceToIntegratorServiceQueue),
  ],
  serverAdapter,
  options: {
    uiConfig: {
      boardTitle: '',
      boardLogo: {
        path: 'https://servicesuserdemo.rahatsistem.com.tr/images/franchise/rahatfatura/establishment/appcode/4/logo.png',
        width: 180,
        height: 40,
      },
      miscLinks: [{ text: 'Çıkış Yap', url: '/account/logout' }],
      favIcon: {
        default:
          'https://servicesuserdemo.rahatsistem.com.tr/images/franchise/rahatfatura/establishment/appcode/4/favicon.ico',
        alternative:
          'https://servicesuserdemo.rahatsistem.com.tr/images/franchise/rahatfatura/establishment/appcode/4/favicon.ico',
      },
    },
  },
});

module.exports = serverAdapter;
