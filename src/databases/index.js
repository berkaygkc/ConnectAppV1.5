const logger = require('../config/logger');

const databases = {};

const createDatabase = (companyCode) => {
  if (!databases[companyCode]) {
    // eslint-disable-next-line security/detect-non-literal-require, import/no-dynamic-require, global-require
    const { PrismaClient } = require(`./${companyCode}`);
    databases[companyCode] = new PrismaClient();
    logger.info(`Database ${companyCode} created`);
  }
};

const database = (companyCode) => {
  if (!databases[companyCode]) {
    createDatabase(companyCode);
  }
  return databases[companyCode];
};

module.exports = database;
