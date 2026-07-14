const jwt = require('jsonwebtoken');
const db = require('../models');
const { setupTenantSchema } = require('../utils/schemaMigrator');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecure_multitenant_boilerplate_secret_key_987654';

// ─── Super Admin Authentication ──────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const admin = await db.Admin.findOne({ where: { email } });
    if (!admin || !admin.is_active || !(await admin.validatePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: 'super_admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Super Admin login successful.',
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email }
    });
  } catch (error) {
    console.error('Super Admin login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── Tenant Registration (Onboarding) ───────────────────────────────────────
exports.createTenant = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { name, subdomain, settings } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({ success: false, error: 'Name and subdomain are required.' });
    }

    // Format schema name safely (e.g. tenant_subdomain)
    const schema_name = `tenant_${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Validate unique subdomain/schema name in master DB
    const existing = await db.Tenant.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { subdomain: subdomain.toLowerCase() },
          { schema_name }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Tenant subdomain or schema name is already in use.' });
    }

    // 1. Create tenant entry in Master Database
    const tenant = await db.Tenant.create({
      name,
      subdomain: subdomain.toLowerCase(),
      schema_name,
      settings: settings || {}
    }, { transaction });

    // 2. Provision isolated database schema and run tenant migrations
    console.log(`[MasterController] Provisioning schema "${schema_name}" for tenant "${name}"...`);
    await setupTenantSchema(schema_name);

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Tenant onboarding completed successfully.',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        schema_name: tenant.schema_name,
        is_active: tenant.is_active
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Tenant onboarding failed:', error);
    res.status(500).json({
      success: false,
      error: `Tenant onboarding failed: ${error.message}`
    });
  }
};

// ─── List All Tenants ────────────────────────────────────────────────────────
exports.listTenants = async (req, res) => {
  try {
    const tenants = await db.Tenant.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, tenants });
  } catch (error) {
    console.error('List tenants error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};
