const _ = require('lodash');

const createAppObject = (decoded) => {
  const { name } = decoded.app;
  const { code } = decoded.franchise;
  const { path, protocol } = decoded.franchise.service_url;
  const logoURL = `${protocol}://${path}/images/franchise/${code}/establishment/appcode/4/logo.png`;
  const faviconURL = `${protocol}://${path}/images/franchise/${code}/establishment/appcode/4/favicon.ico`;
  return {
    name,
    code,
    logo: logoURL,
    favicon: faviconURL,
  };
};

const appsExtractor = (fUrl, urls) => {
  return _.map(urls, (url) => {
    let color;
    let description;
    let logo;
    switch (url.code) {
      case 1:
        color = 'success';
        description = 'Cari, stok ve kıymetlerinizi yönetebileceğiniz ön muhasebe uygulaması.';
        logo = 'fa-solid fa-book';
        break;
      case 2:
        color = 'info';
        description = 'Resmi Giden-Gelen e-Belgelerinizin bulunduğu uygulama.';
        logo = 'fa-solid fa-file-invoice';
        break;
      case 3:
        color = 'warning';
        description = 'Pazaryeri üzerine tüm işlemleri yapabileceğiniz uygulama.';
        logo = 'fa-solid fa-cube';
        break;
      case 4:
        color = 'primary';
        description = 'Muhasebe yazılımınıza entegre olan ve yönetimini sağlayabileceğiniz uygulama.';
        logo = 'fa-solid fa-file-invoice';
        break;
      case 6:
        color = 'mutabakat';
        description = 'Carileriniz ile mütabakat yapabileceğiniz uygulama.';
        logo = 'fa-regular fa-square-check';
        break;
      default:
        color = 'primary';
        description = 'Üretim süreçlerinizi takip edebileceğiniz uygulama.';
        logo = 'fa-solid fa-microchip';
        break;
    }
    return {
      name: url.name,
      color,
      description,
      logo,
      url: `https://${fUrl}/apps/periods/${url.id}`,
    };
  });
};

const createPrismaClient = (companyCode) => {
  // eslint-disable-next-line security/detect-non-literal-require, import/no-dynamic-require, global-require
  const { PrismaClient } = require(`../databases/${companyCode}`);
  return new PrismaClient();
};

module.exports = {
  createAppObject,
  appsExtractor,
  createPrismaClient,
};
