const database = require('../databases');

const createLogRecord = async ({ companyCode, domain, data, status, log }) => {
  return database(companyCode).aPILogs.create({
    data: {
      url: String(domain),
      body: data || {},
      status,
      status_description: { detail: log },
    },
  });
};

const updateLogRecord = async ({ companyCode, id, status, log, error }) => {
  return database(companyCode).aPILogs.update({
    where: { id: Number(id) },
    data: {
      status,
      status_description: { detail: log, error: error || null },
    },
  });
};

module.exports = {
  createLogRecord,
  updateLogRecord,
};
