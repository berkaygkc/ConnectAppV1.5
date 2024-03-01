const moment = require('moment');
const _ = require('lodash');
const { documentsSchema } = require('../schemas');
const database = require('../databases');

const getInvoiceById = async ({ code, id }) => {
  return database(code).invoices.findUnique({ where: { id: Number(id) } });
};

const getInvoiceByExternalId = async ({ code, externalId }) => {
  return database(code).invoices.findFirst({ where: { external_id: String(externalId) } });
};

const getInvoiceByExternalIdAndType = async ({ code, externalId, externalType }) => {
  return database(code).invoices.findUnique({
    where: { external_uniq: { external_id: String(externalId), external_type: String(externalType) } },
  });
};

const listRawInvoices = async ({ code, where, select, order, skip, take }) => {
  return database(code).invoices.findMany({ where, select, orderBy: order, skip, take });
};

const countRawInvoices = async ({ code, where = {} }) => {
  return database(code).invoices.count({ where });
};

const createInvoice = async ({ code, integrator, invoice, freshJson }) => {
  return database(code).invoices.create({
    data: {
      external_id: String(invoice.External.ID),
      external_refno: String(invoice.External.RefNo),
      external_type: invoice.External.Type ? String(invoice.External.Type) : 'ExternalApp',
      integrator,
      uuid: invoice.sys.uuid,
      type: invoice.sys.type,
      profile: invoice.sys.profile,
      serie: invoice.sys.external.serie,
      number: invoice.sys.external.number,
      doc_number: invoice.sys.external.doc_number,
      template_id: invoice.sys.external.template_id,
      issue_date: moment(invoice.IssueDateTime).utc(true).toDate(),
      customer_name: invoice.Customer.Name,
      customer_tax: invoice.Customer.TaxNumber,
      payable_amount: invoice.sys.monetary.payable.toFixed(2),
      currency_code: invoice.sys.currency_code,
      json: invoice,
      fresh_json: freshJson,
      status_code: documentsSchema.status.saved.code,
      status_detail: {
        description: documentsSchema.status.saved.description,
      },
    },
  });
};

const upsertInvoice = async ({ code, integrator, invoice, freshJson }) => {
  return database(code).invoices.upsert({
    where: { external_uniq: { external_id: String(invoice.External.ID), external_type: String(invoice.External.Type) } },
    update: {
      external_refno: String(invoice.External.RefNo),
      integrator,
      uuid: invoice.sys.uuid,
      type: invoice.sys.type,
      profile: invoice.sys.profile,
      serie: invoice.sys.external.serie,
      number: invoice.sys.external.number,
      doc_number: invoice.sys.external.doc_number,
      template_id: invoice.sys.external.template_id,
      issue_date: moment(invoice.IssueDateTime).utc(true).toDate(),
      customer_name: invoice.Customer.Name,
      customer_tax: invoice.Customer.TaxNumber,
      payable_amount: invoice.sys.monetary.payable.toFixed(2),
      currency_code: invoice.sys.currency_code,
      json: invoice,
      fresh_json: freshJson,
    },
    create: {
      external_id: String(invoice.External.ID),
      external_refno: String(invoice.External.RefNo),
      external_type: invoice.External.Type ? String(invoice.External.Type) : 'ExternalApp',
      integrator,
      uuid: invoice.sys.uuid,
      type: invoice.sys.type,
      profile: invoice.sys.profile,
      serie: invoice.sys.external.serie,
      number: invoice.sys.external.number,
      doc_number: invoice.sys.external.doc_number,
      template_id: invoice.sys.external.template_id,
      issue_date: moment(invoice.IssueDateTime).utc(true).toDate(),
      customer_name: invoice.Customer.Name,
      customer_tax: invoice.Customer.TaxNumber,
      payable_amount: invoice.sys.monetary.payable.toFixed(2),
      currency_code: invoice.sys.currency_code,
      json: invoice,
      fresh_json: freshJson,
      status_code: documentsSchema.status.saved.code,
      status_detail: {
        description: documentsSchema.status.saved.description,
      },
    },
  });
};

const deleteInvoice = async ({ code, id }) => {
  return database(code).invoices.delete({ where: { id: Number(id) } });
};

const updateInvoiceAfterSent = async ({ code, id, json }) => {
  return database(code).invoices.update({
    where: { id: Number(id) },
    data: {
      doc_number: String(json.sys.external.doc_number),
      serie: String(json.sys.external.serie),
      serie_reserved: String(json.sys.external.serie_reserved),
      number: Number(json.sys.external.number),
      json,
      is_sended: true,
      send_time: moment().utc(true).toDate(),
    },
  });
};

const updateInvoiceNumberBeforeSend = async ({ code, id, json }) => {
  return database(code).invoices.update({
    where: { id: Number(id) },
    data: {
      doc_number: String(json.sys.external.doc_number),
      serie: String(json.sys.external.serie),
      serie_reserved: String(json.sys.external.serie_reserved),
      number: Number(json.sys.external.number),
      json,
    },
  });
};

// eslint-disable-next-line no-unused-vars
const updateInvoiceAfterQueued = async ({ code, id, jobId }) => {
  // TODO: insert job id to database
  return database(code).invoices.update({
    where: { id: Number(id) },
    data: {
      is_sended: true,
      status_code: documentsSchema.status.queued.code,
      status_detail: {
        description: documentsSchema.status.queued.description,
      },
    },
  });
};

const updateInvoiceStatus = async ({ code, id, status, detail }) => {
  const statusObject = _.find(documentsSchema.status, { code: status });
  return database(code).invoices.update({
    where: { id: Number(id) },
    data: { status_code: statusObject.code, status_detail: { description: statusObject.description, detail } },
  });
};

const markSendStatus = async ({ code, id, isSended, detail }) => {
  const sendTime = isSended ? new Date() : null;
  const statusCode = isSended ? 201 : 100;
  const statusDetail = isSended
    ? { description: 'Gönderildi olarak işaretlendi!', ...detail }
    : { description: 'Gönderim için bekliyor', ...detail };
  return database(code).invoices.update({
    where: { id: Number(id) },
    data: { is_sended: isSended, send_time: sendTime, status_code: statusCode, status_detail: statusDetail },
  });
};

const listInvoiceBySerieAndYear = async ({ code, serie, year }) => {
  return database(code).invoices.findMany({
    where: {
      serie: String(serie),
      issue_date: {
        gte: moment(year).startOf('year').toDate(),
        lte: moment(year).endOf('year').toDate(),
      },
      NOT: { number: null },
    },
    select: {
      number: true,
      issue_date: true,
    },
    orderBy: { number: 'asc' },
  });
};

module.exports = {
  getInvoiceById,
  getInvoiceByExternalId,
  getInvoiceByExternalIdAndType,
  createInvoice,
  upsertInvoice,
  deleteInvoice,
  updateInvoiceAfterSent,
  updateInvoiceAfterQueued,
  updateInvoiceNumberBeforeSend,
  updateInvoiceStatus,
  listRawInvoices,
  countRawInvoices,
  markSendStatus,
  listInvoiceBySerieAndYear,
};
