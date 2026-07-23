const express = require('express');
const router = express.Router();
const tenantResolver = require('../middleware/tenantResolver');
const tenantController = require('../controllers/tenantController');
const oifController = require('../controllers/oifController');
const electronicsController = require('../controllers/electronicsController');
const branchController = require('../controllers/branchController');
const brandController = require('../controllers/brandController');
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

module.exports = router;
