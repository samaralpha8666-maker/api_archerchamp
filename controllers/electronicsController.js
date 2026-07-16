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
    const { id } = req.params;
    const board = await electronicsService.updateBoard(boardModel, id, req.body);
    res.status(200).json({ success: true, board });
  } catch (error) {
    console.error('Update electronic board controller error:', error);
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

