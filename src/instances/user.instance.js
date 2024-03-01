const axios = require('axios');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

const { url, key } = config.instances.user;

const user = axios.create({
  baseURL: url,
});

user.interceptors.request.use((request) => {
  request.headers['Content-Type'] = 'application/json';
  request.headers['api-key'] = key;
  return request;
});

user.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Kullanıcı servisi erişilebilir değil!');
    }
    throw new Error(JSON.stringify(error.response.data));
  },
);

module.exports = user;
