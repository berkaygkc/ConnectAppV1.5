const headerKeys = {
  companyInfo: 'c-info',
  integratorCode: 'integrator-code',
};

const urlList = {
  general: {
    companyInfo: '/general/info/company',
  },
  invoice: {
    validBuildJson: '/invoice/valid.build.json',
    send: '/invoice/send',
    buildXML: '/invoice/build.xml',
    getXSLT: '/invoice/xslt/',
  },
  internal: {
    defs: {
      invoice: {
        codes: {
          findKDVExemption: '/internal/defs/invoice/codes/kdv_exemptions/',
        },
      },
    },
  },
};

module.exports = {
  headerKeys,
  urlList,
};
