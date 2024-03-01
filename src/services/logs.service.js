const { logsModel } = require('../models');
const { logsSchema } = require('../schemas');

const createLogRecord = async ({ companyCode, domain, type, data }) => {
  const status = logsSchema.statusCodesAndDescriptions[type].created.code;
  const log = logsSchema.statusCodesAndDescriptions[type].created.description;
  const logRecord = await logsModel.createLogRecord({ companyCode, domain, data, status, log });
  return logRecord;
};

const updateLogRecord = async ({ companyCode, id, type, move, error }) => {
  const status = logsSchema.statusCodesAndDescriptions[type][move].code;
  const log = logsSchema.statusCodesAndDescriptions[type][move].description;
  const logRecord = await logsModel.updateLogRecord({ companyCode, id, status, log, error });
  return logRecord;
};

module.exports = {
  createLogRecord,
  updateLogRecord,
};
