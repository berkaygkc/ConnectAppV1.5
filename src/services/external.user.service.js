const { userInstance } = require('../instances');

const getInfoFromAppDomain = async (appDomain) => {
  const info = await userInstance.get(`/info/fromdomain/apps/${appDomain}`);
  return info.data;
};

module.exports = {
  getInfoFromAppDomain,
};
