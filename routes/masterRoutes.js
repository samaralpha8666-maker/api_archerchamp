const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const { authenticateMasterAdmin } = require('../middleware/auth');

router.post('/login', masterController.adminLogin);
router.post('/register', masterController.createAdmin);

// Protected master routes
router.post('/tenants', authenticateMasterAdmin, masterController.createTenant);
router.get('/tenants', authenticateMasterAdmin, masterController.listTenants);
router.post('/tenants/:id/admins', authenticateMasterAdmin, masterController.createTenantAdmin);
router.get('/tenants/:id/admins', authenticateMasterAdmin, masterController.listTenantAdmins);
router.put('/profile', authenticateMasterAdmin, masterController.updateMasterProfile);

module.exports = router;
