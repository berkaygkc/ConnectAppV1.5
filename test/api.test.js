const autocannon = require('autocannon');
const config = require('../src/config/config');

const main = async () => {
  const instance = autocannon({
    url: 'http://localhost:4004/api/v1.0/external/invoices',
    connections: 10,
    pipelining: 1,
    duration: 10,
    amount: 100,
    idReplacement: true,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apikey,
      'c-info': '99',
    },
    body: `
    {
      "integrator": "nesbilgi",
      "document": {
        "External": {
          "ID": "[<id>]",
          "RefNo": "[<id>]",
          "Type": "Test"
        },
        "IssueDateTime": "2024-02-28T00:00:00",
        "Type": "SATIS",
        "Notes": [
          {
            "Note": "Varsa not1"
          },
          {
            "Note": "varsa not2"
          },
          {
            "Note": "Şube Adı : sube adi"
          }
        ],
        "Customer": {
          "TaxNumber": "11111111114",
          "TaxOffice": "İSTANBUL",
          "Name": "metin dönmezss",
          "Address": "İSTANBUL",
          "District": "İSTANBUL",
          "City": "İSTANBUL",
          "Country": "Türkiye",
          "PostalCode": null
        },
        "Lines": [
          {
            "Name": "KALEM",
            "Quantity": 2,
            "UnitCode": "ADET",
            "Price": 1,
            "KDV": {
              "Percent": 18
            }
          }
        ]
      }
    }`,
  });

  autocannon.track(instance, { renderProgressBar: true });
};

main();
