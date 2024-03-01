const statusCodesAndDescriptions = {
  invoice: {
    created: {
      code: 100,
      description: 'İstek kabul edildi. Sıraya alındı.',
    },
    validated: {
      code: 101,
      description: 'Doğrulama başarıyla sonuçlandı. Kayıt işlemi yapılacak.',
    },
    success: {
      code: 200,
      description: 'Kayıt işlemi başarılı.',
    },
    failed: {
      code: 400,
      description: 'Kayıt işlemi hata aldı!',
    },
  },
};

const moveTypes = {
  validated: 'validated',
  success: 'success',
  failed: 'failed',
};

module.exports = {
  statusCodesAndDescriptions,
  moveTypes,
};
