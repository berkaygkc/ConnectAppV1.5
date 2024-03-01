const Joi = require('joi');
const config = require('config');

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Env validation error: ${error.message}`);
}

const configVarsSchema = Joi.object().keys({
  port: Joi.number().default(3000),
  apikey: Joi.string().required(),
  jwt: Joi.object()
    .keys({
      secret: Joi.string().required(),
    })
    .required(),
  instances: Joi.object()
    .keys({
      user: Joi.object()
        .keys({
          url: Joi.string().uri().required(),
          key: Joi.string().required(),
        })
        .required(),
      integrator: Joi.object()
        .keys({
          url: Joi.string().uri().required(),
          key: Joi.string().required(),
        })
        .required(),
      notification: Joi.object()
        .keys({
          url: Joi.string().uri().required(),
          key: Joi.string().required(),
        })
        .required(),
      kurulus: Joi.object()
        .keys({
          url: Joi.string().uri().required(),
        })
        .required(),
      redis: Joi.object()
        .keys({
          url: Joi.string().uri().required(),
        })
        .required(),
    })
    .required(),
  database: Joi.object().keys({
    IP: Joi.string().required(),
    NAME: Joi.string().required(),
    USER: Joi.string().required(),
    PASS: Joi.string().required(),
  }),
  settings: Joi.object()
    .keys({
      queues: Joi.object()
        .keys({
          startSendingInvoiceProcess: Joi.object()
            .keys({
              concurrency: Joi.number().required(),
              removeOnComplete: Joi.object()
                .keys({
                  age: Joi.number(),
                  count: Joi.number(),
                })
                .required(),
              removeOnFail: Joi.object()
                .keys({
                  age: Joi.number(),
                  count: Joi.number(),
                })
                .required(),
            })
            .required(),
          sendInvoiceToIntegratorService: Joi.object()
            .keys({
              concurrency: Joi.number().required(),
              removeOnComplete: Joi.object()
                .keys({
                  age: Joi.number(),
                  count: Joi.number(),
                })
                .required(),
              removeOnFail: Joi.object()
                .keys({
                  age: Joi.number(),
                  count: Joi.number(),
                })
                .required(),
            })
            .required(),
        })
        .required(),
    })
    .required(),
});

const { value: configVars, errorConf } = configVarsSchema.prefs({ errors: { label: 'key' } }).validate(config);

if (errorConf) {
  throw new Error(`Config validation error: ${errorConf.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: configVars.port,
  apikey: configVars.apikey,
  jwt: {
    secret: configVars.jwt.secret,
  },
  instances: {
    user: {
      url: configVars.instances.user.url,
      key: configVars.instances.user.key,
    },
    integrator: {
      url: configVars.instances.integrator.url,
      key: configVars.instances.integrator.key,
    },
    notification: {
      url: configVars.instances.notification.url,
      key: configVars.instances.notification.key,
    },
    kurulus: {
      url: configVars.instances.kurulus.url,
    },
    redis: {
      url: configVars.instances.redis.url,
    },
  },
  database: {
    IP: configVars.database.IP,
    NAME: configVars.database.NAME,
    USER: configVars.database.USER,
    PASS: configVars.database.PASS,
  },
  settings: {
    queues: {
      startSendingInvoiceProcess: {
        concurrency: configVars.settings.queues.startSendingInvoiceProcess.concurrency,
        removeOnComplete: configVars.settings.queues.startSendingInvoiceProcess.removeOnComplete,
        removeOnFail: configVars.settings.queues.startSendingInvoiceProcess.removeOnFail,
      },
      sendInvoiceToIntegratorService: {
        concurrency: configVars.settings.queues.sendInvoiceToIntegratorService.concurrency,
        removeOnComplete: configVars.settings.queues.sendInvoiceToIntegratorService.removeOnComplete,
        removeOnFail: configVars.settings.queues.sendInvoiceToIntegratorService.removeOnFail,
      },
    },
  },
};
