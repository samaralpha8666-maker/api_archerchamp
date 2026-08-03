const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models');
const { getTenantConnection } = require('../utils/tenantConnectionManager');

// Fetch public active tenants for signup / login selector dropdowns
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await db.Tenant.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'subdomain'],
      order: [['name', 'ASC']]
    });
    res.status(200).json({
      success: true,
      data: { tenants }
    });
  } catch (error) {
    console.error('Fetch public tenants error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// Verify session JWT token values and fetch corresponding admin / user records
router.get('/verify_token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecure_multitenant_boilerplate_secret_key_987654');

    if (decoded.role === 'super_admin') {
      const admin = await db.Admin.findByPk(decoded.adminId);
      if (!admin || !admin.is_active) {
        return res.status(401).json({ success: false, error: 'Admin account not found or deactivated.' });
      }
      return res.status(200).json({
        success: true,
        data: {
          admin: { id: admin.id, name: admin.name, email: admin.email, role: 'super_admin' }
        }
      });
    } else if (decoded.tenantId) {
      const tenant = await db.Tenant.findByPk(decoded.tenantId);
      if (!tenant || !tenant.is_active) {
        return res.status(401).json({ success: false, error: 'Tenant inactive or not found.' });
      }

      const tenantContext = await getTenantConnection(tenant.schema_name);
      const user = await tenantContext.models.User.findByPk(decoded.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({ success: false, error: 'User account not found or deactivated.' });
      }

      const ALL_MODULES = ['dashboard', 'brands', 'oif', 'electronics', 'qc', 'calibration', 'amc', 'purchase', 'store', 'users'];
      const DEFAULT_ROLE_PERMISSIONS = {
        admin: ALL_MODULES,
        manager: ['dashboard', 'qc', 'calibration', 'amc', 'purchase', 'store'],
        rnd: ['dashboard', 'qc', 'calibration', 'electronics'],
        service: ['dashboard', 'amc', 'calibration'],
        accounts: ['dashboard', 'purchase'],
        store: ['dashboard', 'store'],
        custom: ['dashboard']
      };
      const userPermissions = user.role === 'admin' ? ALL_MODULES : (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0 ? user.permissions : (DEFAULT_ROLE_PERMISSIONS[user.role] || ALL_MODULES));

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department || 'Administration',
            permissions: userPermissions,
            tenantId: tenant.id,
            tenantSubdomain: tenant.subdomain,
            school_name: tenant.name
          }
        }
      });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid token payload.' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
});

module.exports = router;
