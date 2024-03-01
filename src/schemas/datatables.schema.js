/* eslint-disable no-use-before-define */
const moment = require('moment');
const _ = require('lodash');
const documentsSchema = require('./documents.schema');

const emptyList = {
  draw: 0,
  data: [],
  recordsTotal: 0,
  recordsFiltered: 0,
};

const defaultDateWhereSchema = (key, fdate, ldate) => {
  return {
    [key]: {
      gte: moment(fdate).startOf('day').toISOString(),
      lte: moment(ldate).endOf('day').toISOString(),
    },
  };
};

const defaultWhereSchema = () => {
  return {
    is_deleted: false,
  };
};

// Invoice Global Schemas
const invoicesWhereKeys = ['external_refno', 'customer_name', 'customer_tax', 'profile', 'type', 'doc_number'];
const invoicesOrderKeys = ['external_refno', 'customer_name'];

const invoicesWhereSchema = (value) => {
  if (!value) return {};
  return {
    OR: invoicesWhereKeys.map((k) => {
      return { [k]: { contains: normalizeString(value), mode: 'insensitive' } };
    }),
  };
};
const invoicesOrderSchema = (key = 1, dir = 'asc') => {
  if (key <= 0 || key > invoicesOrderKeys.length) return [{ issue_date: 'asc' }, { [invoicesOrderKeys[0]]: dir }];
  if (['asc', 'desc'].indexOf(dir) === -1) return [{ issue_date: 'asc' }, { [invoicesOrderKeys[0]]: 'asc' }];
  return [{ issue_date: 'asc' }, { [invoicesOrderKeys[Number(key) - 1]]: dir }];
};

// Waiting Invoices Schemas
const waitingInvoicesDefaultWhereSchema = () => {
  return {
    ...defaultWhereSchema(),
    is_sended: false,
    status_code: {
      in: [documentsSchema.status.waiting.code, documentsSchema.status.saved.code],
    },
  };
};

const waitingInvoicesNormalizeRecordsForUI = (records) => {
  return _.map(records, (r) => {
    return {
      id: r.id,
      erp_no: r.external_refno,
      erp_type: r.external_type,
      receiver_name: r.profile === 'IHRACAT' ? r.json.BuyerCustomer.Name : r.customer_name,
      receiver_tax: r.profile === 'IHRACAT' ? r.json.BuyerCustomer.TaxNumber : r.customer_tax,
      invoice_date: moment(r.issue_date).format('DD.MM.YYYY'),
      invoice_payable: r.payable_amount,
      currency_code: r.currency_code,
      invoice_profile: r.profile,
      invoice_type: r.type,
      process: '',
      notes: r.json?.Notes,
    };
  });
};

// Sended Invoices Schemas
const sendedInvoicesDefaultWhereSchema = () => {
  return {
    ...defaultWhereSchema(),
    is_sended: true,
  };
};

const sendedInvoicesWhereStatusCodeSchema = (value) => {
  if (!value) return {};
  if (!Array.isArray(value) || value.length === 0) return {};
  return { status_code: { in: _.map(value, (v) => Number(v)) } };
};
const sendedInvoicesNormalizeRecordsForUI = (records) => {
  return _.map(records, (r) => {
    return {
      id: r.id,
      erp_no: r.external_refno,
      erp_type: r.external_type,
      invoice_no: r.doc_number,
      receiver_name: r.profile === 'IHRACAT' ? r.json.BuyerCustomer.Name : r.customer_name,
      receiver_tax: r.profile === 'IHRACAT' ? r.json.BuyerCustomer.TaxNumber : r.customer_tax,
      invoice_date: moment(r.issue_date).format('DD.MM.YYYY'),
      invoice_payable: r.payable_amount,
      currency_code: r.currency_code,
      invoice_profile: r.profile,
      invoice_type: r.type,
      status_code: r.status_code,
      status_desc: JSON.stringify(r.status_detail),
      process: '',
      notes: r.json?.Notes,
    };
  });
};

module.exports = {
  emptyList,
  defaultDateWhereSchema,

  invoicesWhereSchema,
  invoicesOrderSchema,
  waitingInvoicesDefaultWhereSchema,
  waitingInvoicesNormalizeRecordsForUI,
  sendedInvoicesDefaultWhereSchema,
  sendedInvoicesWhereStatusCodeSchema,
  sendedInvoicesNormalizeRecordsForUI,
};

const normalizeString = (str) => {
  return String(str);
};
