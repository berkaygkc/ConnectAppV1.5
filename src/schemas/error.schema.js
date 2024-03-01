const invoice = {
  cannotFound: 'Fatura bulunamadı!',
  createdBefore: 'Fatura daha önce oluşturulmuş!',
  cannotBeUpdateCauseSended: 'Fatura entegratör sistemine gönderildiği için güncellenemez!',
  cannotBeDeleteCauseSended: 'Fatura entegratör sistemine gönderildiği için silinemez!',
  cannotBeRefreshCauseSended: 'Fatura entegratör sistemine gönderildiği için yenilenemez!',
  cannotFoundBarcode: 'Faturada barkod bilgisi bulunamadı!',
  cannotCalculateNumber: 'Seri bu tarih ile kullanılamaz!',
  cannotCalculateNumberCauseBeforeLastNumber: 'Seri, son kesilen fatura tarihinden eski olduğu için kullanılamaz!',
  cannotCalculateNumberCauseInvalidSerie: 'Geçersiz fatura serisi!',
  erroredWhenCalculatingNumber: 'Fatura numarası hesaplanırken hata oluştu!',
};

const integrator = {
  infoNotFound: 'Entegratör bilgisi bulunamadı!',
};

module.exports = {
  invoice,
  integrator,
};
