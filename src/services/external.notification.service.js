const { notificationInstance } = require('../instances');

const sendToRahatLocalApp = async (keys, payload) => {
  const info = await notificationInstance.post(`/sendrmq/localapp_coms/queue`, { keys, payload });
  return info.data;
};

const sendToAccountingApp = async (keys, payload) => {
  const info = await notificationInstance.post(`/sendrmq/apps_coms/service.notification`, { keys, payload });
  return info.data;
};

module.exports = {
  sendToRahatLocalApp,
  sendToAccountingApp,
};
