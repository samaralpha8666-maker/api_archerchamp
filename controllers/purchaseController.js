/**
 * Controller handling Purchase Requisition operations
 */

// List all purchase requisitions
exports.list = async (req, res) => {
  try {
    const { PurchaseRequisition } = req.tenantModels || {};
    if (!PurchaseRequisition) {
      return res.status(200).json({ success: true, requisitions: [] });
    }
    await PurchaseRequisition.sync();
    const requisitions = await PurchaseRequisition.findAll({
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json({ success: true, requisitions });
  } catch (error) {
    console.error('Purchase list error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch purchase requisitions' });
  }
};

// Create a new purchase requisition
exports.create = async (req, res) => {
  try {
    const { PurchaseRequisition } = req.tenantModels || {};
    if (!PurchaseRequisition) {
      return res.status(500).json({ success: false, error: 'PurchaseRequisition model not found' });
    }
    await PurchaseRequisition.sync();

    const payload = {
      ...req.body,
      id: req.body.id || `PR-${Date.now()}`
    };

    const requisition = await PurchaseRequisition.create(payload);
    return res.status(201).json({ success: true, requisition });
  } catch (error) {
    console.error('Purchase create error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create purchase requisition' });
  }
};

// Update an existing purchase requisition (Approval / Status change)
exports.update = async (req, res) => {
  try {
    const { PurchaseRequisition } = req.tenantModels || {};
    if (!PurchaseRequisition) {
      return res.status(500).json({ success: false, error: 'PurchaseRequisition model not found' });
    }
    await PurchaseRequisition.sync();

    const reqId = req.params.id;
    const requisition = await PurchaseRequisition.findByPk(reqId);
    if (!requisition) {
      return res.status(404).json({ success: false, error: 'Purchase requisition not found' });
    }

    await requisition.update(req.body);
    return res.status(200).json({ success: true, requisition });
  } catch (error) {
    console.error('Purchase update error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update purchase requisition' });
  }
};

// Delete a purchase requisition
exports.delete = async (req, res) => {
  try {
    const { PurchaseRequisition } = req.tenantModels || {};
    if (!PurchaseRequisition) {
      return res.status(500).json({ success: false, error: 'PurchaseRequisition model not found' });
    }
    await PurchaseRequisition.sync();

    const reqId = req.params.id;
    const requisition = await PurchaseRequisition.findByPk(reqId);
    if (!requisition) {
      return res.status(404).json({ success: false, error: 'Purchase requisition not found' });
    }

    await requisition.destroy();
    return res.status(200).json({ success: true, message: 'Purchase requisition deleted successfully' });
  } catch (error) {
    console.error('Purchase delete error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete purchase requisition' });
  }
};
