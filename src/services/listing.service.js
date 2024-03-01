const moment = require('moment');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { invoicesModel } = require('../models');
const { datatablesSchema } = require('../schemas');

const checkDates = (startDate, endDate) => {
  if (!startDate || !endDate) throw new ApiError(httpStatus.BAD_REQUEST, 'Başlangıç ve bitiş tarhleri zorunludur!');
  if (!moment(startDate, 'YYYY-MM-DD').isValid() || !moment(endDate, 'YYYY-MM-DD').isValid())
    throw new ApiError(httpStatus.BAD_REQUEST, 'Başlangıç ve bitiş tarihleri geçerli bir tarih formatında olmalıdır!');
  if (moment(startDate, 'YYYY-MM-DD').isAfter(moment(endDate, 'YYYY-MM-DD')))
    throw new ApiError(httpStatus.BAD_REQUEST, 'Başlangıç tarihi bitiş tarihinden büyük olamaz!');
};

const getWaitingInvoicesList = async (companyCode, query) => {
  const { draw, start, length } = query;

  const { fdate, ldate } = query;
  checkDates(fdate, ldate);

  const totalRecordsWhere = {
    ...datatablesSchema.waitingInvoicesDefaultWhereSchema(),
  };
  const filteredRecordsWhere = {
    ...datatablesSchema.waitingInvoicesDefaultWhereSchema(),
    ...datatablesSchema.defaultDateWhereSchema('issue_date', fdate, ldate),
    ...datatablesSchema.invoicesWhereSchema(query.searchbox),
  };
  const filteredRecordOrder = datatablesSchema.invoicesOrderSchema(query.order[0].column, query.order[0].dir);

  const recordsTotal = await invoicesModel.countRawInvoices({ code: companyCode, where: totalRecordsWhere });
  const recordsFilteredCount = await invoicesModel.countRawInvoices({ code: companyCode, where: filteredRecordsWhere });
  const recordsFiltered = await invoicesModel.listRawInvoices({
    code: companyCode,
    where: filteredRecordsWhere,
    order: filteredRecordOrder,
    skip: Number(start),
    take: Number(length),
  });
  return {
    draw: Number(draw),
    recordsTotal,
    recordsFiltered: recordsFilteredCount,
    data: datatablesSchema.waitingInvoicesNormalizeRecordsForUI(recordsFiltered),
  };
};

const getSendedInvoicesList = async (companyCode, query) => {
  const { draw, start, length } = query;

  const { fdate, ldate } = query;
  checkDates(fdate, ldate);

  const totalRecordsWhere = {
    ...datatablesSchema.sendedInvoicesDefaultWhereSchema(),
  };
  const filteredRecordsWhere = {
    ...datatablesSchema.sendedInvoicesDefaultWhereSchema(),
    ...datatablesSchema.defaultDateWhereSchema('issue_date', fdate, ldate),
    ...datatablesSchema.invoicesWhereSchema(query.searchbox),
    ...datatablesSchema.sendedInvoicesWhereStatusCodeSchema(query.status_codes),
  };
  const filteredRecordOrder = datatablesSchema.invoicesOrderSchema(query.order[0].column, query.order[0].dir);

  const recordsTotal = await invoicesModel.countRawInvoices({ code: companyCode, where: totalRecordsWhere });
  const recordsFilteredCount = await invoicesModel.countRawInvoices({ code: companyCode, where: filteredRecordsWhere });
  const recordsFiltered = await invoicesModel.listRawInvoices({
    code: companyCode,
    where: filteredRecordsWhere,
    order: filteredRecordOrder,
    skip: Number(start),
    take: Number(length),
  });
  return {
    draw: Number(draw),
    recordsTotal,
    recordsFiltered: recordsFilteredCount,
    data: datatablesSchema.sendedInvoicesNormalizeRecordsForUI(recordsFiltered),
  };
};

module.exports = {
  getWaitingInvoicesList,
  getSendedInvoicesList,
};
