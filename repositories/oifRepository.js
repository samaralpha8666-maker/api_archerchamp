exports.create = async (oifModel, payload) => {
  return await oifModel.create(payload);
};

exports.findAll = async (oifModel, filter = {}) => {
  return await oifModel.findAll({
    where: filter,
    order: [['createdAt', 'DESC']]
  });
};

exports.findByPk = async (oifModel, id) => {
  return await oifModel.findByPk(id);
};

exports.count = async (oifModel) => {
  return await oifModel.count();
};

exports.save = async (orderInstance) => {
  return await orderInstance.save();
};
