const jwt = require('jsonwebtoken');
const db = require('../models');

/**
 * Authenticates a tenant-level user using JWT.
 * Expects tenant connection context to be resolved by tenantResolver middleware first.
 */
async function authenticateTenantUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecure_multitenant_boilerplate_secret_key_987654');

    // Security Check: Verify token context matches resolved tenant
    if (decoded.tenantId !== req.tenant.id) {
      return res.status(403).json({ success: false, error: 'Access denied: Token belongs to a different tenant.' });
    }

    // Verify user exists inside tenant schema
    const user = await req.tenantModels.User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: 'User account not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid authentication token.' });
  }
}

/**
 * Authenticates a master database Super Admin using JWT.
 */
async function authenticateMasterAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecure_multitenant_boilerplate_secret_key_987654');

    if (decoded.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Access denied: Requires Super Admin privileges.' });
    }

    const admin = await db.Admin.findByPk(decoded.adminId);
    if (!admin || !admin.is_active) {
      return res.status(401).json({ success: false, error: 'Admin account not found or deactivated.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid authentication token.' });
  }
}

module.exports = {
  authenticateTenantUser,
  authenticateMasterAdmin
};
