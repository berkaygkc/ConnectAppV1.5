const barcodeKeys = ['KargoKodu', 'Barkod'];

const status = {
  waiting: {
    code: 100,
    description: 'Gönderim için bekliyor',
  },
  saved: {
    code: 101,
    description: 'Taslaklara kaydedildi',
  },
  queued: {
    code: 102,
    description: 'Belge gönderilmek için sıraya alındı',
  },
  sent: {
    code: 201,
    description: 'Gönderildi ancak sırada bekliyor',
  },
  completedOnDatabase: {
    code: 200,
    description: 'Fatura başarıyla gönderildi ve veritabanına kaydedildi',
  },
  completed: {
    code: 202,
    description: 'Gönderildi ve başarıyla tamamlandı',
  },
  failedWhenSending: {
    code: 401,
    description: 'Belge gönderilirken hata aldı!',
  },
  failedAfterSent: {
    code: 402,
    description: 'Belge gönderildikten sonra hata aldı!',
  },
  unkown: {
    code: 999,
    description: 'Bilinmeyen durum',
  },
};

const profiles = {
  TICARIFATURA: 1,
  TEMELFATURA: 1,
  IHRACAT: 1,
  KAMU: 1,
  EARSIVFATURA: 2,
  TEMELIRSALIYE: 3,
  EARSIVBELGE: 5,
};

const docTypes = {
  invoice: 'invoice',
  einvoice: 'invoice',
  earchive: 'invoice',
  edespatch: 'despatch',
  esevoucer: 'sevoucer',
};

const markTypes = {
  markSended: 'mark-sended',
  markNotSended: 'mark-not-sended',
  markSolved: 'mark-solved',
};

module.exports = {
  barcodeKeys,
  status,
  profiles,
  docTypes,
  markTypes,
};
