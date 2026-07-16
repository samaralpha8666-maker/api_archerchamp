const oifService = require('../services/oifService');

exports.create = async (req, res) => {
  try {
    const oifModel = req.tenantModels.OifOrder;
    const order = await oifService.createOrder(oifModel, req.body, req.user.id, req.user.name);
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create OIF controller error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.list = async (req, res) => {
  try {
    const oifModel = req.tenantModels.OifOrder;
    const { branch } = req.query;
    const orders = await oifService.getAllOrders(oifModel, branch);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('List OIF controller error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const oifModel = req.tenantModels.OifOrder;
    const { id } = req.params;
    const order = await oifService.updateOrder(oifModel, id, req.body);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Update OIF controller error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};
