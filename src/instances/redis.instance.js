const Redis = require('ioredis');
const config = require('../config/config');
const logger = require('../config/logger');

const client = new Redis(config.instances.redis.url, {
  maxRetriesPerRequest: null,
});
client.on('connect', () => {
  logger.info('Redis connected');
});
client.on('error', (error) => {
  logger.error(`Redis error: ${error}`);
});
setInterval(() => {
  client.ping();
}, 10000);

module.exports = client;
