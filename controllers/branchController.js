const branchService = require('../services/branchService');

exports.list = async (req, res) => {
  try {
    const branchModel = req.tenantModels.Branch;
    const branches = await branchService.getAllBranches(branchModel);
    res.status(200).json({ success: true, branches });
  } catch (error) {
    console.error('List branches error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const branchModel = req.tenantModels.Branch;
    const branch = await branchService.createBranch(branchModel, req.body);
    res.status(201).json({ success: true, branch });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const branchModel = req.tenantModels.Branch;
    const { id } = req.params;
    const branch = await branchService.updateBranch(branchModel, id, req.body);
    res.status(200).json({ success: true, branch });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const branchModel = req.tenantModels.Branch;
    const { id } = req.params;
    await branchService.deleteBranch(branchModel, id);
    res.status(200).json({ success: true, message: 'Branch deleted successfully.' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};
