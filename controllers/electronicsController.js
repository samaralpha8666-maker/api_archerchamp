const electronicsService = require('../services/electronicsService');

exports.list = async (req, res) => {
  try {
    const boardModel = req.tenantModels.ElectronicsBoard;
    const { branch } = req.query;
    const boards = await electronicsService.getAllBoards(boardModel, branch);
    res.status(200).json({ success: true, boards });
  } catch (error) {
    console.error('List electronic boards controller error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const boardModel = req.tenantModels.ElectronicsBoard;
    const board = await electronicsService.createBoard(boardModel, req.body);
    res.status(201).json({ success: true, board });
  } catch (error) {
    console.error('Create electronic board controller error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const boardModel = req.tenantModels.ElectronicsBoard;
    const logModel = req.tenantModels.ElectronicsTransactionLog;
    const { id } = req.params;
    const operatorName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'System User';
    const board = await electronicsService.updateBoard(boardModel, logModel, id, req.body, operatorName);
    res.status(200).json({ success: true, board });
  } catch (error) {
    console.error('Update electronic board controller error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.manufacture = async (req, res) => {
  try {
    const boardModel = req.tenantModels.ElectronicsBoard;
    const logModel = req.tenantModels.ElectronicsTransactionLog;
    const { id } = req.params;
    const { qty, ref } = req.body;
    const operatorName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'System User';
    const board = await electronicsService.manufactureBoard(boardModel, logModel, id, parseInt(qty) || 0, ref, operatorName);
    res.status(200).json({ success: true, board });
  } catch (error) {
    console.error('Manufacture electronic board controller error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.logs = async (req, res) => {
  try {
    const boardModel = req.tenantModels.ElectronicsBoard;
    const logModel = req.tenantModels.ElectronicsTransactionLog;
    const { boardId } = req.query;
    const logs = await electronicsService.getTransactionLogs(logModel, boardModel, boardId);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('Get electronics transaction logs error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const boardModel = req.tenantModels.ElectronicsBoard;
    const { id } = req.params;
    await electronicsService.deleteBoard(boardModel, id);
    res.status(200).json({ success: true, message: 'Board deleted successfully.' });
  } catch (error) {
    console.error('Delete electronic board controller error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

