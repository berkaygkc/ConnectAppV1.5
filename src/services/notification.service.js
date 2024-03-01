const externalNotificationService = require('./external.notification.service');
const { findStatusDetail } = require('../schemas/notification.schema');

const notifyToServiceForDocument = async (compCode, docType, document, status) => {
  const splittedExType = document.external_type.split(':');
  const statusDetail = findStatusDetail(docType, status);
  let keys = [];
  let payload = {};
  switch (splittedExType[1]) {
    case 'accountingApp':
      keys = [{ name: `accounting.edoc.${docType}.status.update`, exist: false }];
      payload = { company: splittedExType[2], period: splittedExType[3], data: statusDetail };
      return externalNotificationService.sendToAccountingApp(keys, payload);
    case 'rahatLocalApp':
      keys = [
        {
          name: `localApp.tunnel.${Buffer.from(`${document.json.Supplier.TaxNumber}*${compCode}##`).toString('base64')}.edoc`,
          exist: false,
        },
      ];
      payload = { code: docType, type: 'status.update', data: statusDetail };
      return externalNotificationService.sendToRahatLocalApp(keys, payload);
    default:
      break;
  }
};

const refreshRequestToNotificationService = async (compCode, docType, document) => {
  const splittedExType = document.external_type.split(':');
  const requestDetail = {
    erpId: document.external_id,
    ref_no: document.external_refno,
  };
  let keys = [];
  let payload = {};
  switch (splittedExType[1]) {
    case 'rahatLocalApp':
      keys = [
        {
          name: `localApp.tunnel.${Buffer.from(`${document.json.Supplier.TaxNumber}*${compCode}##`).toString('base64')}.edoc`,
          exist: false,
        },
      ];
      payload = { code: docType, type: 'data.refresh', data: requestDetail };
      return externalNotificationService.sendToRahatLocalApp(keys, payload);
    default:
      break;
  }
};

module.exports = {
  notifyToServiceForDocument,
  refreshRequestToNotificationService,
};
