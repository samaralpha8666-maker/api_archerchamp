const db = require('../models');
const { getTenantConnection } = require('../utils/tenantConnectionManager');

/**
 * Middleware to dynamically identify and bind tenant schema connection context.
 */
async function tenantResolver(req, res, next) {
  try {
    // 1. Resolve subdomain from header 'x-tenant-subdomain' or hostname
    let subdomain = req.headers['x-tenant-subdomain'];

    if (!subdomain) {
      // Fallback: Parse from URL subdomain (e.g. tenant1.domain.com -> tenant1)
      const host = req.headers.host || '';
      const parts = host.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }

    if (!subdomain) {
      return res.status(400).json({
        success: false,
        error: 'Tenant resolution failed: x-tenant-subdomain header or subdomain host is required.'
      });
    }

    // 2. Query tenant details in master database
    const tenant = await db.Tenant.findOne({
      where: {
        subdomain: subdomain.toLowerCase(),
        is_active: true
      }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: `Tenant "${subdomain}" not found or inactive.`
      });
    }

    // 3. Resolve connection & models for this tenant schema
    const tenantContext = await getTenantConnection(tenant.schema_name);

    // 4. Inject context into request object
    req.tenant = tenant;
    req.tenantDb = tenantContext.sequelize;
    req.tenantModels = tenantContext.models;

    next();
  } catch (error) {
    console.error('Tenant resolution middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error resolving tenant context.'
    });
  }
}

module.exports = tenantResolver;
