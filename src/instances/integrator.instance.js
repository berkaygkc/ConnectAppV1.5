const axios = require('axios');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

const { url, key } = config.instances.integrator;

const integrator = axios.create({
  baseURL: url,
});

integrator.interceptors.request.use((request) => {
  request.headers['Content-Type'] = 'application/json';
  request.headers['api-key'] = key;
  return request;
});

integrator.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Entegratör servisi erişilebilir değil!');
    }
    const errorResponse = error.response?.data?.data || error.response?.data || error.response;

    throw new Error(errorResponse);
  },
);

module.exports = integrator;
