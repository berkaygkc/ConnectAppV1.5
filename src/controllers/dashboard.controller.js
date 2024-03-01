const catchAsync = require('../utils/catchAsync');

const getDashboardPage = catchAsync(async (req, res) => {
  return res.render('pages/dashboard/dashboard', {
    page: {
      name: 'dashboard',
      display: 'Kontrol Paneli',
      menu: 'dashboard',
      uppermenu: '',
    },
    data: {
      invoice: {
        total_invoice: 0,
        successful_invoice: 0,
        errored_invoice: 0,
        marked_invoice: 0,
        waiting_invoice: 0,
        percent: 0,
      },
      despatch: {
        total_despatch: 0,
        successful_despatch: 0,
        errored_despatch: 0,
        marked_despatch: 0,
        waiting_despatch: 0,
        percent: 0,
      },
      balance: {
        total_purchased: 0,
        total_used: 0,
        balance: 0,
      },
    },
  });
});

module.exports = {
  getDashboardPage,
};
