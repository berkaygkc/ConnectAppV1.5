/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
const _ = require('lodash');
const httpStatus = require('http-status');
const moment = require('moment');
const ApiError = require('../utils/ApiError');
const { invoicesModel } = require('../models');
const { documentsSchema, errorSchema, logsSchema } = require('../schemas');
const integratorService = require('./external.integrator.service');
const notificationService = require('./notification.service');
const logsService = require('./logs.service');
const logger = require('../config/logger');

const createInvoice = async (companyCode, domain, integrator, invoice) => {
  const { created } = await checkIntegratorAndInvoiceFromDatabase({
    companyCode,
    integrator,
    externalId: invoice.document.External.ID,
    externalType: invoice.document.External.Type,
  });
  if (created) throw new ApiError(httpStatus.BAD_REQUEST, errorSchema.invoice.createdBefore);
  const log = await logsService.createLogRecord({
    companyCode,
    domain,
    type: documentsSchema.docTypes.invoice,
    data: invoice,
  });
  const validatedAndBuildedInvoice = await validateAndBuildInvoiceJSON(companyCode, integrator, invoice);
  await logsService.updateLogRecord({
    companyCode,
    id: log.id,
    type: documentsSchema.docTypes.invoice,
    move: logsSchema.moveTypes.validated,
  });
  const createdInvoice = await invoicesModel.createInvoice({
    code: companyCode,
    integrator,
    invoice: validatedAndBuildedInvoice.json,
    freshJson: invoice,
  });
  await logsService.updateLogRecord({
    companyCode,
    id: log.id,
    type: documentsSchema.docTypes.invoice,
    move: logsSchema.moveTypes.success,
  });
  await notificationService.notifyToServiceForDocument(
    companyCode,
    documentsSchema.docTypes.invoice,
    createdInvoice,
    documentsSchema.status.saved.code,
  );
  return { detail: validatedAndBuildedInvoice.detail, json: createdInvoice.json };
};

const upsertInvoice = async (companyCode, domain, integrator, invoice) => {
  const { sended } = await checkIntegratorAndInvoiceFromDatabase({
    companyCode,
    integrator,
    externalId: invoice.document.External.ID,
    externalType: invoice.document.External.Type,
  });
  if (sended) throw new ApiError(httpStatus.BAD_REQUEST, errorSchema.invoice.cannotBeUpdateCauseSended);
  const log = await logsService.createLogRecord({
    companyCode,
    domain,
    type: documentsSchema.docTypes.invoice,
    data: invoice,
  });
  const validatedAndBuildedInvoice = await validateAndBuildInvoiceJSON(companyCode, integrator, invoice);
  await logsService.updateLogRecord({
    companyCode,
    id: log.id,
    type: documentsSchema.docTypes.invoice,
    move: logsSchema.moveTypes.validated,
  });
  const updatedOrCreatedInvoice = await invoicesModel.upsertInvoice({
    code: companyCode,
    integrator,
    invoice: validatedAndBuildedInvoice.json,
    freshJson: invoice,
  });
  await logsService.updateLogRecord({
    companyCode,
    id: log.id,
    type: documentsSchema.docTypes.invoice,
    move: logsSchema.moveTypes.success,
  });
  await notificationService.notifyToServiceForDocument(
    companyCode,
    documentsSchema.docTypes.invoice,
    updatedOrCreatedInvoice,
    documentsSchema.status.saved.code,
  );
  return { detail: validatedAndBuildedInvoice.detail, json: updatedOrCreatedInvoice.json };
};

const deleteInvoice = async (companyCode, id) => {
  const invoice = await invoicesModel.getInvoiceByExternalId({ code: companyCode, externalId: id });
  if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, errorSchema.invoice.cannotFound);
  if (invoice.isSended) throw new ApiError(httpStatus.BAD_REQUEST, errorSchema.invoice.cannotBeUpdateCauseSended);
  const deletedInvoice = await invoicesModel.deleteInvoice({ code: companyCode, id: invoice.id });
  return deletedInvoice;
};

const refreshInvoice = async (companyCode, id) => {
  const invoice = await invoicesModel.getInvoiceById({ code: companyCode, id });
  if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, errorSchema.invoice.cannotFound);
  if (invoice.isSended) throw new ApiError(httpStatus.BAD_REQUEST, errorSchema.invoice.cannotBeRefreshCauseSended);
  await notificationService.refreshRequestToNotificationService(companyCode, documentsSchema.docTypes.invoice, invoice);
};

const setQueuedStatusForInvoice = async (companyCode, id, jobId) => {
  const invoice = await invoicesModel.getInvoiceById({ code: companyCode, id });
  if (!invoice) throw new Error(errorSchema.invoice.cannotFound);
  await invoicesModel.updateInvoiceAfterQueued({ code: companyCode, id, jobId });
  notificationService.notifyToServiceForDocument(
    companyCode,
    documentsSchema.docTypes.invoice,
    invoice,
    documentsSchema.status.queued.code,
  );
  return invoice;
};

const calculateInvoiceNumberForQueue = async (companyCode, id, additionalSerie) => {
  const invoice = await invoicesModel.getInvoiceById({ code: companyCode, id });
  if (!invoice) throw new Error(errorSchema.invoice.cannotFound);
  try {
    if (additionalSerie) invoice.json.sys.number_serie = additionalSerie;
    const json = await calculateInvoiceNumber(companyCode, invoice.json);
    await invoicesModel.updateInvoiceNumberBeforeSend({ code: companyCode, id, json });
    return json;
  } catch (error) {
    await invoicesModel.updateInvoiceStatus({
      code: companyCode,
      id,
      status: documentsSchema.status.failedWhenSending.code,
      detail: error.message,
    });
    notificationService.notifyToServiceForDocument(
      companyCode,
      documentsSchema.docTypes.invoice,
      invoice,
      documentsSchema.status.failedWhenSending.code,
    );
    logger.error(
      `Error when calculating invoice number for queue: ${error.message}, companyCode: ${companyCode}, id: ${id}`,
    );
    throw new Error(error);
  }
};

const sendInvoiceFromDatabase = async (companyCode, id, additionalSerie) => {
  const invoice = await invoicesModel.getInvoiceById({ code: companyCode, id });
  if (!invoice) throw new Error(errorSchema.invoice.cannotFound);
  if (invoice.status !== documentsSchema.status.queued.code) await setQueuedStatusForInvoice(companyCode, id);
  let { json } = invoice;
  // eslint-disable-next-line camelcase
  const { doc_number, serie, serie_reserved, number } = json.sys.external;
  // eslint-disable-next-line camelcase
  const { number_serie } = json.sys;
  // eslint-disable-next-line camelcase
  if (!number_serie || !doc_number || !serie || !serie_reserved || !number)
    json = await calculateInvoiceNumberForQueue(companyCode, id, additionalSerie);
  try {
    const sentInvoice = await integratorService.sendInvoice(companyCode, invoice.integrator, json);
    await invoicesModel.updateInvoiceAfterSent({ code: companyCode, id, json });
    await invoicesModel.updateInvoiceStatus({
      code: companyCode,
      id,
      status: documentsSchema.status.completedOnDatabase.code,
    });
    notificationService.notifyToServiceForDocument(
      companyCode,
      documentsSchema.docTypes.invoice,
      invoice,
      documentsSchema.status.completed.code,
    );
    return sentInvoice;
  } catch (error) {
    await invoicesModel.updateInvoiceAfterSent({ code: companyCode, id, json });
    await invoicesModel.updateInvoiceStatus({
      code: companyCode,
      id,
      status: documentsSchema.status.failedWhenSending.code,
      detail: error.message,
    });
    notificationService.notifyToServiceForDocument(
      companyCode,
      documentsSchema.docTypes.invoice,
      invoice,
      documentsSchema.status.failedAfterSent.code,
    );
    logger.error(`Error when sending invoice from database: ${error.message}, companyCode: ${companyCode}, id: ${id}`);
    throw new Error(error);
  }
};

const getInvoiceXML = async (companyCode, id) => {
  const invoice = await invoicesModel.getInvoiceById({ code: companyCode, id });
  const xml = await integratorService.buildInvoiceXML({
    companyCode,
    integrator: invoice.integrator,
    invoice: invoice.json,
  });
  return xml;
};

const getInvoiceXSLT = async (companyCode, id) => {
  const invoice = await invoicesModel.getInvoiceById({ code: companyCode, id });
  const xsltB64 = await integratorService.getInvoiceXSLT({
    companyCode,
    integrator: invoice.integrator,
    xsltId: invoice.json.sys.external.template_id,
  });
  const xslt = Buffer.from(xsltB64.content, 'base64').toString('utf-8');
  return xslt;
};

const getInvoiceBarcode = async (companyCode, id) => {
  const invoice = await invoicesModel.getInvoiceById({ code: companyCode, id });
  const barcode = extractBarcodeFromNotes(invoice.json.Notes);
  const data = {
    receiver: { name: invoice.json.Customer.Name, address: invoice.json.Customer.Address },
    lines: _.map(invoice.json.Lines, (line) => {
      return {
        name: line.Name,
        quantity: line.Quantity,
        price: line.Price,
        unit: line.UnitCode,
      };
    }),
    barcode,
  };
  return data;
};

const markSendStatus = async (companyCode, id, isSended) => {
  const invoice = await invoicesModel.getInvoiceById({ code: companyCode, id });
  const description = {
    [`old_desc_${moment().format('YYYYMMDDHHmmss')}`]: {
      desc: invoice.status_detail,
      process: isSended ? documentsSchema.markTypes.markSended : documentsSchema.markTypes.markNotSended,
      mark_time: moment().format('YYYY-MM-DD HH:mm:ss'),
    },
  };
  const marked = await invoicesModel.markSendStatus({ code: companyCode, id, isSended, detail: description });
  return marked;
};

module.exports = {
  createInvoice,
  upsertInvoice,
  deleteInvoice,
  refreshInvoice,
  setQueuedStatusForInvoice,
  calculateInvoiceNumberForQueue,
  sendInvoiceFromDatabase,
  getInvoiceXML,
  getInvoiceXSLT,
  getInvoiceBarcode,
  markSendStatus,
};

const checkIntegratorAndInvoiceFromDatabase = async ({ companyCode, integrator, externalId, externalType }) => {
  if (!integrator) throw new ApiError(httpStatus.BAD_REQUEST, errorSchema.integrator.cannotFound);
  const invoiceInDb = await invoicesModel.getInvoiceByExternalIdAndType({
    code: companyCode,
    externalId,
    externalType,
  });
  const result = { created: false, sended: false };
  if (invoiceInDb) {
    result.created = true;
    if (invoiceInDb.isSended) result.sended = true;
  }
  return result;
};

const validateAndBuildInvoiceJSON = async (companyCode, integrator, invoice) => {
  const companyInfo = await integratorService.getCompanyInfo(companyCode, integrator);
  const company = companyInfo.detail;
  const supplier = createSupplier(company);
  Object.assign(invoice.document, { Supplier: supplier });
  const validatedAndBuildedInvoice = await integratorService.validateAndBuildInvoiceJSON(companyCode, integrator, invoice);
  return validatedAndBuildedInvoice;
};

const extractBarcodeFromNotes = (notes) => {
  const barcodeNote = _.find(notes, (n) => _.some(documentsSchema.barcodeKeys, (k) => _.includes(n.Note, k)));
  if (!barcodeNote) throw new ApiError(httpStatus.NOT_FOUND, errorSchema.invoice.cannotFoundBarcode);
  const barcode = barcodeNote.Note.split(' ')[1].trim();
  return barcode;
};

const createSupplier = (company) => {
  return {
    TaxNumber: company.tax_number,
    TaxOffice: company.tax_office,
    Name: company.name,
    Alias: null,
    Address: company.address,
    District: company.district,
    City: company.city,
    Country: company.country,
    PostalCode: null,
    Phone: company.phone_number,
    Fax: company.fax_number,
    Mail: company.email,
    Website: null,
    sys: extractCompanyName(company),
  };
};

const findTaxType = (taxNumber) => {
  if (taxNumber.length === 11) return 'TCKN';
  return 'VKN';
};

const extractCompanyName = (company) => {
  if (findTaxType(company.tax_number) === 'TCKN') {
    const splittedName = company.name.split(' ');
    const name = company.name.substring(0, company.name.lastIndexOf(' '));
    const surname = splittedName.length > 1 ? splittedName[splittedName.length - 1] : '.';
    return { name, surname };
  }
  return { name: company.name };
};

const calculateInvoiceNumber = async (companyCode, json) => {
  const invoiceDate = moment(json.IssueDateTime).startOf('day');
  const invoiceYear = invoiceDate.format('YYYY');
  const serie = json.sys.number_serie;
  const result = { number: undefined, serie_result: undefined, serie_reserved: undefined };
  if (serie.length === 2) {
    let lastLetter = 'A';
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const combinedSeries = `${serie}${lastLetter}`;
      const listInvoicesOfSerieAndYear = await invoicesModel.listInvoiceBySerieAndYear({
        code: companyCode,
        serie: combinedSeries,
        year: invoiceYear,
      });
      if (listInvoicesOfSerieAndYear.length === 0) result.number = 1;
      if (!result.number) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [index, invoice] of listInvoicesOfSerieAndYear.entries()) {
          if (
            listInvoicesOfSerieAndYear[index + 1] &&
            Number(invoice.number) < Number(listInvoicesOfSerieAndYear[index + 1].number) &&
            Number(invoice.number) + 1 !== Number(listInvoicesOfSerieAndYear[index + 1].number)
          ) {
            if (
              invoiceDate.isSameOrAfter(moment(invoice.issue_date).startOf('day')) &&
              invoiceDate.isSameOrBefore(moment(listInvoicesOfSerieAndYear[index + 1].issue_date).endOf('day'))
            ) {
              result.number = Number(invoice.number) + 1;
              break;
            }
          }
        }
        if (
          !result.number &&
          invoiceDate.isSameOrAfter(
            moment(listInvoicesOfSerieAndYear[listInvoicesOfSerieAndYear.length - 1].issue_date).startOf('day'),
          )
        ) {
          result.number = Number(listInvoicesOfSerieAndYear[listInvoicesOfSerieAndYear.length - 1].number) + 1;
        }
        if (!result.number) lastLetter = String.fromCharCode(lastLetter.charCodeAt(0) + 1);
        if (!result.number && lastLetter.charCodeAt() > 90) throw new Error(errorSchema.invoice.cannotCalculateNumber);
        if (result.number) {
          result.serie_result = combinedSeries;
          result.serie_reserved = serie;
          break;
        }
      }
    }
  } else if (serie.length === 3) {
    const listInvoicesOfSerieAndYear = await invoicesModel.listInvoiceBySerieAndYear({
      code: companyCode,
      serie,
      year: invoiceYear,
    });
    if (listInvoicesOfSerieAndYear.length === 0) result.number = 1;
    if (!result.number) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [index, invoice] of listInvoicesOfSerieAndYear.entries()) {
        if (
          listInvoicesOfSerieAndYear[index + 1] &&
          Number(invoice.number) < Number(listInvoicesOfSerieAndYear[index + 1].number) &&
          Number(invoice.number) + 1 !== Number(listInvoicesOfSerieAndYear[index + 1].number)
        ) {
          if (
            invoiceDate.isSameOrAfter(moment(invoice.issue_date).startOf('day')) &&
            invoiceDate.isSameOrBefore(moment(listInvoicesOfSerieAndYear[index + 1].issue_date).endOf('day'))
          ) {
            result.number = Number(invoice.number) + 1;
            break;
          }
        }
      }
      if (
        !result.number &&
        invoiceDate.isSameOrAfter(
          moment(listInvoicesOfSerieAndYear[listInvoicesOfSerieAndYear.length - 1].issue_date).startOf('day'),
        )
      ) {
        result.number = Number(listInvoicesOfSerieAndYear[listInvoicesOfSerieAndYear.length - 1].number) + 1;
      }
      if (!result.number) throw new Error(errorSchema.invoice.cannotCalculateNumberCauseBeforeLastNumber);
      result.serie_result = serie;
      result.serie_reserved = serie;
    }
  } else if (serie.length === 16) {
    result.number = Number(serie.substring(7, 16));
    result.serie_result = serie.substring(0, 3);
    result.serie_reserved = serie.substring(0, 3);
  } else {
    throw new Error(errorSchema.invoice.cannotCalculateNumberCauseInvalidSerie);
  }
  if (!result.number) throw new Error(errorSchema.invoice.erroredWhenCalculatingNumber);
  const resultNumber = `${result.serie_result}${invoiceYear}${addZero(result.number, 9)}`;
  json.sys.number_serie = resultNumber;
  json.sys.external.doc_number = resultNumber;
  json.sys.external.serie = result.serie_result;
  json.sys.external.serie_reserved = result.serie_reserved;
  json.sys.external.number = result.number;
  return json;
};

const addZero = (number, length) => {
  let str = String(number);
  while (str.length < length) {
    str = `0${str}`;
  }
  return str;
};
