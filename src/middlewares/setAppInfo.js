const config = require('../config/config');
const { externalUserService } = require('../services');
const catchAsync = require('../utils/catchAsync');

module.exports = catchAsync(async (req, res, next) => {
  const domain = encodeURIComponent(req.get('host'));
  try {
    const appInfo = await externalUserService.getInfoFromAppDomain(domain);
    const { name, code } = appInfo.detail;
    const { path, protocol } = appInfo.service_url;
    const logoURL = `${protocol}://${path}/images/franchise/${code}/establishment/appcode/6/logo.png`;
    const faviconURL = `${protocol}://${path}/images/franchise/${code}/establishment/appcode/6/favicon.ico`;
    res.locals = {
      app: {
        name,
        code,
        logo: logoURL,
        favicon: faviconURL,
        kurulus: `https://${appInfo.kurulus.url}`,
      },
    };
  } catch (error) {
    res.locals = {
      app: {
        name: 'Rahat Belge',
        code: 6,
        logo: '',
        favicon: '',
        kurulus: config.instances.kurulus.url,
      },
    };
  }
  next();
});
