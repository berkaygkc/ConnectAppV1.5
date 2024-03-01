const catchAsync = require('../utils/catchAsync');
const { accountService } = require('../services');

const login = catchAsync(async (req, res) => {
  try {
    const { token, expiresIn } = req.query;
    const domain = encodeURIComponent(req.get('host'));
    const sessionId = await accountService.login(token, expiresIn, domain);
    res.cookie('sessionId-app-6', sessionId, {
      httpOnly: true,
    });
    return res.redirect('/');
  } catch (error) {
    return res.redirect(res.locals.app.kurulus);
  }
});

const logout = catchAsync(async (req, res) => {
  const sessionId = req.cookies['sessionId-app-6'];
  const domain = encodeURIComponent(req.get('host'));
  await accountService.logout(sessionId, domain);
  res.clearCookie('sessionId-app-6');
  return res.redirect('/account/login');
});

module.exports = {
  login,
  logout,
};
