exports.create = async (brandModel, payload) => {
  return await brandModel.create(payload);
};

exports.findAll = async (brandModel) => {
  return await brandModel.findAll({
    order: [['createdAt', 'DESC']]
  });
};

exports.bulkCreate = async (brandModel, list) => {
  return await brandModel.bulkCreate(list);
};

exports.findByPk = async (brandModel, id) => {
  return await brandModel.findByPk(id);
};

exports.save = async (brandInstance) => {
  return await brandInstance.save();
};

exports.destroy = async (brandInstance) => {
  return await brandInstance.destroy();
};
