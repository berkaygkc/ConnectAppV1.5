const axios = require('axios');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

const { url, key } = config.instances.notification;

const notification = axios.create({
  baseURL: url,
});

notification.interceptors.request.use((request) => {
  request.headers['Content-Type'] = 'application/json';
  request.headers['api-key'] = key;
  return request;
});

notification.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Bildirim servisi erişilebilir değil!');
    }
    throw new Error(JSON.stringify(error.response.data));
  },
);

module.exports = notification;
