exports.create = async (branchModel, payload) => {
  return await branchModel.create(payload);
};

exports.findAll = async (branchModel) => {
  return await branchModel.findAll({
    order: [['createdAt', 'DESC']]
  });
};

exports.bulkCreate = async (branchModel, list) => {
  return await branchModel.bulkCreate(list);
};

exports.findByPk = async (branchModel, id) => {
  return await branchModel.findByPk(id);
};

exports.save = async (branchInstance) => {
  return await branchInstance.save();
};

exports.destroy = async (branchInstance) => {
  return await branchInstance.destroy();
};
