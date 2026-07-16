exports.findAll = async (boardModel, filter = {}) => {
  return await boardModel.findAll({ where: filter });
};

exports.bulkCreate = async (boardModel, boardsList) => {
  return await boardModel.bulkCreate(boardsList);
};

exports.create = async (boardModel, payload) => {
  return await boardModel.create(payload);
};

exports.findByPk = async (boardModel, id) => {
  return await boardModel.findByPk(id);
};

exports.save = async (boardInstance) => {
  return await boardInstance.save();
};

exports.destroy = async (boardInstance) => {
  return await boardInstance.destroy();
};

