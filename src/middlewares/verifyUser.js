const _ = require('lodash');
const utils = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { accountService } = require('../services');

module.exports = catchAsync(async (req, res, next) => {
  try {
    if (!req.cookies) return res.redirect('/account/login');
    if (!req.cookies['sessionId-app-6']) return res.redirect('/account/login');
    const sessionId = req.cookies['sessionId-app-6'];
    const domain = encodeURIComponent(req.get('host'));
    const { decoded, token } = await accountService.verifyToken(sessionId, domain);

    req.user = decoded;
    req.services = {
      userService: {
        token: decoded.user.service_user_token,
      },
      kurulusService: {
        token,
      },
    };
    req.db = decoded.company.company_code;
    req.integrator = decoded.company.app_connect_target;
    const user = {
      full_name: decoded.user.full_name,
      email: decoded.user.mail,
      username: decoded.user.username,
    };
    const company = {
      name: decoded.company.name,
      tax_number: decoded.company.tax_number,
      code: decoded.company.company_code,
      period: Number(decoded.company.period),
    };

    const app = utils.createAppObject(decoded);
    const apps = utils.appsExtractor(decoded.franchise.url, decoded.urls);
    const uiInfo = {
      user,
      app,
      apps,
      company,
      permissions: {
        documents: {
          create: !_.find(decoded.user.permissions, { permission: 'connect:documents:create:none' }),
          send_with_serie: !!_.find(decoded.user.permissions, { permission: 'connect:documents:send_with_serie' }),
        },
      },
    };
    res.locals = uiInfo;
    next();
  } catch (error) {
    return res.redirect('/account/login');
  }
});
