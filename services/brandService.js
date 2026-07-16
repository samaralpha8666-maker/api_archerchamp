const brandRepository = require('../repositories/brandRepository');

const DEFAULT_BRANDS = [
  { name: 'Archerchem', code: 'ARCHERCHEM', description: 'Industrial scales and balances' },
  { name: 'Radwag', code: 'RADWAG', description: 'Accredited laboratory balances' },
  { name: 'Tapson', code: 'TAPSON', description: 'Analytical balances' },
  { name: 'ADRA', code: 'ADRA', description: 'Micro-precision weight matching instruments' }
];

exports.getAllBrands = async (brandModel) => {
  let list = await brandRepository.findAll(brandModel);
  if (list.length === 0) {
    console.log('[Brand Service] Seeding default brands...');
    for (const item of DEFAULT_BRANDS) {
      const exists = await brandModel.findOne({ where: { code: item.code } });
      if (!exists) {
        await brandModel.create(item);
      }
    }
    list = await brandRepository.findAll(brandModel);
  }
  return list;
};

exports.createBrand = async (brandModel, data) => {
  const payload = {
    name: data.name,
    code: data.code || data.name.toUpperCase().replace(/\s+/g, '_'),
    description: data.description || ''
  };
  return await brandRepository.create(brandModel, payload);
};

exports.updateBrand = async (brandModel, id, data) => {
  const brand = await brandRepository.findByPk(brandModel, id);
  if (!brand) {
    throw new Error('Brand not found.');
  }

  if (data.name !== undefined) brand.name = data.name;
  if (data.code !== undefined) brand.code = data.code;
  if (data.description !== undefined) brand.description = data.description;

  return await brandRepository.save(brand);
};

exports.deleteBrand = async (brandModel, id) => {
  const brand = await brandRepository.findByPk(brandModel, id);
  if (!brand) {
    throw new Error('Brand not found.');
  }
  return await brandRepository.destroy(brand);
};
