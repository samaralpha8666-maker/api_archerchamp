/**
 * Controller handling Calibration Certificate operations
 */

// List all calibration certificates
exports.list = async (req, res) => {
  try {
    const { CalibrationCertificate } = req.tenantModels || {};
    if (!CalibrationCertificate) {
      return res.status(200).json({ success: true, certificates: [] });
    }
    await CalibrationCertificate.sync();
    const certificates = await CalibrationCertificate.findAll({
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json({ success: true, certificates });
  } catch (error) {
    console.error('Calibration list error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch calibration certificates' });
  }
};

// Create a new calibration certificate
exports.create = async (req, res) => {
  try {
    const { CalibrationCertificate } = req.tenantModels || {};
    if (!CalibrationCertificate) {
      return res.status(500).json({ success: false, error: 'CalibrationCertificate model not found' });
    }
    await CalibrationCertificate.sync();

    const cert = await CalibrationCertificate.create(req.body);
    return res.status(201).json({ success: true, certificate: cert });
  } catch (error) {
    console.error('Calibration create error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create calibration certificate' });
  }
};

// Update an existing calibration certificate
exports.update = async (req, res) => {
  try {
    const { CalibrationCertificate } = req.tenantModels || {};
    if (!CalibrationCertificate) {
      return res.status(500).json({ success: false, error: 'CalibrationCertificate model not found' });
    }
    await CalibrationCertificate.sync();

    const certId = req.params.id;
    const cert = await CalibrationCertificate.findByPk(certId);
    if (!cert) {
      return res.status(404).json({ success: false, error: 'Calibration certificate not found' });
    }

    await cert.update(req.body);
    return res.status(200).json({ success: true, certificate: cert });
  } catch (error) {
    console.error('Calibration update error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update calibration certificate' });
  }
};

// Delete a calibration certificate
exports.delete = async (req, res) => {
  try {
    const { CalibrationCertificate } = req.tenantModels || {};
    if (!CalibrationCertificate) {
      return res.status(500).json({ success: false, error: 'CalibrationCertificate model not found' });
    }
    await CalibrationCertificate.sync();

    const certId = req.params.id;
    const cert = await CalibrationCertificate.findByPk(certId);
    if (!cert) {
      return res.status(404).json({ success: false, error: 'Calibration certificate not found' });
    }

    await cert.destroy();
    return res.status(200).json({ success: true, message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Calibration delete error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete calibration certificate' });
  }
};
