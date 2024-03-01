const _ = require('lodash');
const documentsSchema = require('./documents.schema');

const findStatusDetail = (document, status) => {
  const statusObject = _.find(documentsSchema.status, { code: status });
  const statusDetail = {
    erpId: document.external_id,
    edoc_status: status,
    edoc_status_detail: statusObject.description,
    profile: documentsSchema.profiles[document.profile],
    new: {
      serie: document.doc_number ? document.doc_number.substring(0, 3) : null,
      number: document.doc_number ? document.doc_number.substring(3, 16) : null,
      document_number: document.doc_number,
      serie_reserve: document.serie_reserved,
      ref_no: document.external_refno,
    },
  };
  return statusDetail;
};

module.exports = {
  findStatusDetail,
};
