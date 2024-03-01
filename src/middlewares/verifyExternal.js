const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

module.exports = catchAsync(async (req, res, next) => {
  const apiKey = req.get('api-key');
  const company = req.get('c-info');
  if (!apiKey || !company || apiKey !== config.apikey) throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  req.db = company;
  next();
});
