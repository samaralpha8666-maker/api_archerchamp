/**
 * Controller handling QC Test Report operations
 */

// List all QC reports
exports.list = async (req, res) => {
  try {
    const { QcReport } = req.tenantModels || {};
    if (!QcReport) {
      return res.status(200).json({ success: true, reports: [] });
    }
    await QcReport.sync();
    const reports = await QcReport.findAll({
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error('QC list error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch QC reports' });
  }
};

// Create a new QC report
exports.create = async (req, res) => {
  try {
    const { QcReport } = req.tenantModels || {};
    if (!QcReport) {
      return res.status(500).json({ success: false, error: 'QcReport model not found' });
    }
    await QcReport.sync();

    const report = await QcReport.create(req.body);
    return res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('QC create error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create QC report' });
  }
};

// Update an existing QC report
exports.update = async (req, res) => {
  try {
    const { QcReport } = req.tenantModels || {};
    if (!QcReport) {
      return res.status(500).json({ success: false, error: 'QcReport model not found' });
    }
    await QcReport.sync();

    const reportId = req.params.id;
    const report = await QcReport.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'QC report not found' });
    }

    await report.update(req.body);
    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('QC update error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update QC report' });
  }
};

// Delete a QC report
exports.delete = async (req, res) => {
  try {
    const { QcReport } = req.tenantModels || {};
    if (!QcReport) {
      return res.status(500).json({ success: false, error: 'QcReport model not found' });
    }
    await QcReport.sync();

    const reportId = req.params.id;
    const report = await QcReport.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'QC report not found' });
    }

    await report.destroy();
    return res.status(200).json({ success: true, message: 'QC report deleted successfully' });
  } catch (error) {
    console.error('QC delete error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete QC report' });
  }
};
