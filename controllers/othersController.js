/**
 * Controller handling OTHERS section endpoints:
 * - Reports Summary
 * - OIML Calculations
 * - Stamping Applications
 * - System Notifications
 */

// 1. Reports Summary
exports.getReportsSummary = async (req, res) => {
  try {
    const { OifOrder, ElectronicsBoard, PurchaseRequisition, Branch, Brand, User } = req.tenantModels;
    const location = req.query.location;

    // Run parallel count queries
    const [oifCount, electronicsCount, prCount, branchCount, brandCount, userCount] = await Promise.all([
      OifOrder ? OifOrder.count() : 0,
      ElectronicsBoard ? ElectronicsBoard.count() : 0,
      PurchaseRequisition ? PurchaseRequisition.count() : 0,
      Branch ? Branch.count() : 0,
      Brand ? Brand.count() : 0,
      User ? User.count() : 0
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        location: location || 'All Locations',
        oifCount,
        electronicsCount,
        prCount,
        branchCount,
        brandCount,
        userCount,
        stockValuation: '₹2.45 Cr',
        lowStockItems: 12
      }
    });
  } catch (error) {
    console.error('getReportsSummary error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch reports summary' });
  }
};

// 2. OIML Calculation Records
exports.getOimlRecords = async (req, res) => {
  try {
    const { OimlRecord } = req.tenantModels || {};
    if (!OimlRecord) return res.status(200).json({ success: true, records: [] });
    await OimlRecord.sync();
    const records = await OimlRecord.findAll({ order: [['id', 'DESC']], limit: 50 });
    return res.status(200).json({ success: true, records });
  } catch (error) {
    console.error('getOimlRecords error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch OIML records' });
  }
};

exports.createOimlRecord = async (req, res) => {
  try {
    const { OimlRecord } = req.tenantModels || {};
    if (!OimlRecord) return res.status(500).json({ success: false, error: 'OimlRecord model not found' });
    await OimlRecord.sync();
    const record = await OimlRecord.create(req.body);
    return res.status(201).json({ success: true, record });
  } catch (error) {
    console.error('createOimlRecord error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to save OIML calculation record' });
  }
};

// 3. Stamping Applications
exports.getStampingApplications = async (req, res) => {
  try {
    const { StampingApplication } = req.tenantModels || {};
    if (!StampingApplication) {
      return res.status(200).json({ success: true, applications: [] });
    }
    await StampingApplication.sync();
    const applications = await StampingApplication.findAll({ order: [['id', 'DESC']] });
    return res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('getStampingApplications error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch stamping applications' });
  }
};

exports.createStampingApplication = async (req, res) => {
  try {
    const { StampingApplication } = req.tenantModels || {};
    if (!StampingApplication) {
      return res.status(500).json({ success: false, error: 'StampingApplication model not found on tenant schema' });
    }
    await StampingApplication.sync();

    const { date, appNo, to, subject, mfgLic, dlrLic, repLic, lcrNo, chequeRef, grandTotal, rows, status } = req.body;
    const application = await StampingApplication.create({
      date: date || new Date().toISOString().split('T')[0],
      appNo: appNo || '',
      to: to || '',
      subject: subject || '',
      mfgLic: mfgLic || '',
      dlrLic: dlrLic || '',
      repLic: repLic || '',
      lcrNo: lcrNo || '',
      chequeRef: chequeRef || '',
      grandTotal: parseFloat(grandTotal) || 0,
      rows: Array.isArray(rows) ? rows : [],
      status: status || 'pending'
    });
    return res.status(201).json({ success: true, application });
  } catch (error) {
    console.error('createStampingApplication error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create stamping application' });
  }
};

exports.deleteStampingApplication = async (req, res) => {
  try {
    const { StampingApplication } = req.tenantModels || {};
    if (!StampingApplication) {
      return res.status(500).json({ success: false, error: 'StampingApplication model not found on tenant schema' });
    }
    await StampingApplication.sync();
    await StampingApplication.destroy({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Stamping application deleted successfully' });
  } catch (error) {
    console.error('deleteStampingApplication error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete stamping application' });
  }
};

// 4. Notifications
exports.getNotifications = async (req, res) => {
  try {
    const { Notification } = req.tenantModels;
    let notifications = await Notification.findAll({ order: [['id', 'DESC']], limit: 50 });

    // Seed default notifications if table is empty
    if (notifications.length === 0) {
      const defaultNotifications = [
        { title: 'New OIF Created', description: 'OIF-2026-045 for Malad dispatch pending verification', type: 'order', color: 'warning', read: false },
        { title: 'Purchase Approval Pending', description: 'PR-2026-003 waiting for manager digital approval', type: 'approval', color: 'primary', read: false },
        { title: 'Low Stock Alert — Sathivali Store', description: '5 items below minimum threshold reorder limit', type: 'alert', color: 'danger', read: false },
        { title: 'Low Part Alert — Display Board BOM', description: 'IC Register microchip: only 3 units remaining in stock', type: 'alert', color: 'info', read: false },
        { title: 'OIF Dispatched', description: 'OIF-2026-040 dispatched successfully to Pune client', type: 'success', color: 'success', read: true }
      ];
      notifications = await Notification.bulkCreate(defaultNotifications);
    }

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const { Notification } = req.tenantModels;
    await Notification.update({ read: true }, { where: { read: false } });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);
    return res.status(500).json({ success: false, error: 'Failed to mark notifications read' });
  }
};
