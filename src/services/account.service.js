const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const config = require('../config/config');
const { redis } = require('../instances');

const login = async (token, expiresIn, hostname) => {
  jwt.verify(token, config.jwt.secret);
  const sessionId = uuid.v4();
  await redis.setex(`sessions:${hostname}:${sessionId}`, expiresIn, token);
  return sessionId;
};

const logout = async (sessionId, hostname) => {
  await redis.del(`sessions:${hostname}:${sessionId}`);
};

const verifyToken = async (sessionId, domain) => {
  if (!(await redis.exists(`sessions:${domain}:${sessionId}`))) throw new Error('Session not found');
  const token = await redis.get(`sessions:${domain}:${sessionId}`);
  const decoded = jwt.verify(token, config.jwt.secret);
  return { decoded, token };
};
module.exports = {
  login,
  logout,
  verifyToken,
};
