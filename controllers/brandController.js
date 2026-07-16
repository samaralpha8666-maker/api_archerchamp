const brandService = require('../services/brandService');

exports.list = async (req, res) => {
  try {
    const brandModel = req.tenantModels.Brand;
    const brands = await brandService.getAllBrands(brandModel);
    res.status(200).json({ success: true, brands });
  } catch (error) {
    console.error('List brands error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const brandModel = req.tenantModels.Brand;
    const brand = await brandService.createBrand(brandModel, req.body);
    res.status(201).json({ success: true, brand });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const brandModel = req.tenantModels.Brand;
    const { id } = req.params;
    const brand = await brandService.updateBrand(brandModel, id, req.body);
    res.status(200).json({ success: true, brand });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const brandModel = req.tenantModels.Brand;
    const { id } = req.params;
    await brandService.deleteBrand(brandModel, id);
    res.status(200).json({ success: true, message: 'Brand deleted successfully.' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};
