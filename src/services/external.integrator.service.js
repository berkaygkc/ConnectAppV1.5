const { integratorInstance } = require('../instances');
const { integratorSchema } = require('../schemas');

const createDefaultHeaders = (companyCode, integrator) => {
  return {
    [integratorSchema.headerKeys.companyInfo]: companyCode,
    [integratorSchema.headerKeys.integratorCode]: integrator,
  };
};

const getCompanyInfo = async (companyCode, integrator) => {
  const companyInfo = await integratorInstance.get(integratorSchema.urlList.general.companyInfo, {
    headers: { ...createDefaultHeaders(companyCode, integrator) },
  });
  return companyInfo.data.data;
};

const validateAndBuildInvoiceJSON = async (companyCode, integrator, invoice) => {
  const validatedAndBuildedInvoice = await integratorInstance.post(
    integratorSchema.urlList.invoice.validBuildJson,
    invoice,
    {
      headers: { ...createDefaultHeaders(companyCode, integrator) },
    },
  );
  return validatedAndBuildedInvoice.data;
};

const sendInvoice = async (companyCode, integrator, invoice) => {
  const response = await integratorInstance.post(integratorSchema.urlList.invoice.send, invoice, {
    headers: { ...createDefaultHeaders(companyCode, integrator) },
  });
  return response.data.data;
};

const buildInvoiceXML = async ({ companyCode, integrator, invoice }) => {
  const xml = await integratorInstance.post(integratorSchema.urlList.invoice.buildXML, invoice, {
    headers: { ...createDefaultHeaders(companyCode, integrator) },
  });
  return xml.data;
};

const getInvoiceXSLT = async ({ companyCode, integrator, xsltId }) => {
  const xslt = await integratorInstance.get(`${integratorSchema.urlList.invoice.getXSLT}${xsltId}`, {
    headers: { ...createDefaultHeaders(companyCode, integrator) },
  });
  return xslt.data;
};

// Internal Defs Invoice

const findKDVExemption = async (type) => {
  const types = await integratorInstance.get(
    `${integratorSchema.urlList.internal.defs.invoice.codes.findKDVExemption}${type}`,
  );
  return types.data;
};

module.exports = {
  getCompanyInfo,

  validateAndBuildInvoiceJSON,
  sendInvoice,
  buildInvoiceXML,
  getInvoiceXSLT,
  findKDVExemption,
};
