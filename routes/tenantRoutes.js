const express = require('express');
const router = express.Router();
const tenantResolver = require('../middleware/tenantResolver');
const tenantController = require('../controllers/tenantController');
const oifController = require('../controllers/oifController');
const electronicsController = require('../controllers/electronicsController');
const branchController = require('../controllers/branchController');
const brandController = require('../controllers/brandController');
const othersController = require('../controllers/othersController');
const calibrationController = require('../controllers/calibrationController');
const qcController = require('../controllers/qcController');
const purchaseController = require('../controllers/purchaseController');
const storeController = require('../controllers/storeController');
const { authenticateTenantUser } = require('../middleware/auth');

// All tenant routes require resolving the tenant context
router.use(tenantResolver);

// Public dynamic signup & login
router.post('/signup', tenantController.signup);
router.post('/login', tenantController.login);

// Protected dynamic context routes
router.use(authenticateTenantUser);

router.post('/documents', tenantController.createDocument);
router.get('/documents', tenantController.listDocuments);
router.put('/profile', tenantController.updateTenantProfile);

// User Management Routes
router.get('/users', tenantController.listUsers);
router.post('/users', tenantController.createUser);
router.put('/users/:id', tenantController.updateUser);
router.delete('/users/:id', tenantController.deleteUser);

// OIF Order Routes
router.post('/oif', oifController.create);
router.get('/oif', oifController.list);
router.put('/oif/:id', oifController.update);

// Electronics BOM Routes
router.get('/electronics', electronicsController.list);
router.post('/electronics', electronicsController.create);
router.put('/electronics/:id', electronicsController.update);
router.delete('/electronics/:id', electronicsController.delete);
router.post('/electronics/:id/manufacture', electronicsController.manufacture);
router.get('/electronics/logs', electronicsController.logs);

// Branch Routes
router.get('/branches', branchController.list);
router.post('/branches', branchController.create);
router.put('/branches/:id', branchController.update);
router.delete('/branches/:id', branchController.delete);

// Brand Routes
router.get('/brands', brandController.list);
router.post('/brands', brandController.create);
router.put('/brands/:id', brandController.update);
router.delete('/brands/:id', brandController.delete);

// Purchase Requisition Routes
router.get('/purchase', purchaseController.list);
router.post('/purchase', purchaseController.create);
router.put('/purchase/:id', purchaseController.update);
router.delete('/purchase/:id', purchaseController.delete);

// Calibration Certificate Routes
router.get('/calibration', calibrationController.list);
router.post('/calibration', calibrationController.create);
router.put('/calibration/:id', calibrationController.update);
router.delete('/calibration/:id', calibrationController.delete);

// QC Report Routes
router.get('/qc', qcController.list);
router.post('/qc', qcController.create);
router.put('/qc/:id', qcController.update);
router.delete('/qc/:id', qcController.delete);

// Store & Inventory Routes
router.get('/store', storeController.list);
router.post('/store', storeController.create);
router.put('/store/:id', storeController.update);
router.post('/store/:id/adjust', storeController.adjustStock);
router.delete('/store/:id', storeController.delete);
router.get('/store/history', storeController.history);

// Reports Summary Route
router.get('/reports/summary', othersController.getReportsSummary);

// OIML Calculation Routes
router.get('/oiml', othersController.getOimlRecords);
router.post('/oiml', othersController.createOimlRecord);

// Stamping Application Routes
router.get('/stamping', othersController.getStampingApplications);
router.post('/stamping', othersController.createStampingApplication);
router.delete('/stamping/:id', othersController.deleteStampingApplication);

// Notifications Routes
router.get('/notifications', othersController.getNotifications);
router.post('/notifications/mark-read', othersController.markAllNotificationsRead);

module.exports = router;
