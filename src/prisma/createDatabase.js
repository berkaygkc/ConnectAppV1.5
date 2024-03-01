const fs = require('fs');
const { exec } = require('child_process');
const config = require('../config/config');
const logger = require('../config/logger');

const [compId] = process.argv.slice(2);
const { IP, NAME, USER, PASS } = config.database;

if (!compId) {
  logger.error('compId is required');
  process.exit(1);
}

const output = `../databases/${compId}`;
const url = `${USER}:${PASS}@${IP}/${NAME}_${compId}`;
const schema = fs.readFileSync('./src/prisma/schema.prisma', 'utf8');
const newSchema = schema.replace(`../databases/global`, output).replace(`USER:PASS@IP/NAME`, url);
fs.writeFileSync('./src/prisma/newschema.prisma', newSchema, 'utf-8');

const createDB = exec(`prisma db push --schema ./src/prisma/newschema.prisma`, function (error, stdout, stderr) {
  if (error) throw error;
  logger.info(stdout);
  logger.error(stderr);
});

createDB.on('exit', function (code, signal) {
  fs.unlinkSync('./src/prisma/newschema.prisma');
  logger.info(`İşlem tamamlandı. İşlem kodu: ${code}, signal: ${signal}`);
});
