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
      admin: { id: admin.id, name: admin.name, email: admin.email, role: 'super_admin' }
    });
  } catch (error) {
    console.error('Super Admin login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── Register New Super Admin ───────────────────────────────────────────────
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
    }

    const existing = await db.Admin.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Admin email is already registered.' });
    }

    const admin = await db.Admin.create({
      name,
      email,
      password
    });

    res.status(201).json({
      success: true,
      message: 'Super Admin registered successfully.',
      admin: { id: admin.id, name: admin.name, email: admin.email }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── Tenant Registration (Onboarding) ───────────────────────────────────────
exports.createTenant = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { name, subdomain, settings, adminName, adminEmail, adminPassword, logo } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({ success: false, error: 'Name and subdomain are required.' });
    }

    if (adminEmail || adminPassword || adminName) {
      if (!adminEmail || !adminPassword || !adminName) {
        return res.status(400).json({ success: false, error: 'Admin Name, Email, and Password are all required to set up the company admin.' });
      }
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

    // Save logo inside settings payload
    const tenantSettings = {
      ...(settings || {}),
      logo: logo || ''
    };

    // 1. Create tenant entry in Master Database
    const tenant = await db.Tenant.create({
      name,
      subdomain: subdomain.toLowerCase(),
      schema_name,
      settings: tenantSettings
    }, { transaction });

    // 2. Provision isolated database schema and run tenant migrations
    console.log(`[MasterController] Provisioning schema "${schema_name}" for tenant "${name}"...`);
    await setupTenantSchema(schema_name);

    await transaction.commit();

    // 3. Create Tenant Admin User inside the newly created tenant schema
    if (adminEmail && adminPassword && adminName) {
      console.log(`[MasterController] Seeding admin user "${adminEmail}" inside schema "${schema_name}"...`);
      const { getTenantConnection } = require('../utils/tenantConnectionManager');
      const tenantContext = await getTenantConnection(schema_name);
      await tenantContext.models.User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log(`[MasterController] Seeded admin user "${adminEmail}" successfully.`);
    }

    res.status(201).json({
      success: true,
      message: 'Tenant onboarding completed successfully.',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        schema_name: tenant.schema_name,
        is_active: tenant.is_active,
        settings: tenant.settings
      }
    });
  } catch (error) {
    // Check if transaction has already been committed/closed
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
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

// ─── Update Super Admin Profile/Password ────────────────────────────────────
exports.updateMasterProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = req.admin;

    if (name) admin.name = name;
    if (email) {
      const existing = await db.Admin.findOne({
        where: {
          email,
          id: { [db.Sequelize.Op.ne]: admin.id }
        }
      });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Email is already in use.' });
      }
      admin.email = email;
    }
    if (password) {
      admin.password = password;
    }

    await admin.save();
    res.status(200).json({
      success: true,
      message: 'Super Admin profile updated successfully.',
      admin: { id: admin.id, name: admin.name, email: admin.email, role: 'super_admin' }
    });
  } catch (error) {
    console.error('Update master profile error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── Create Tenant Admin User ────────────────────────────────────────────────
exports.createTenantAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    // 1. Find tenant in master DB
    const tenant = await db.Tenant.findByPk(id);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found.' });
    }

    // 2. Resolve tenant connection & database model dynamically
    const { getTenantConnection } = require('../utils/tenantConnectionManager');
    const tenantContext = await getTenantConnection(tenant.schema_name);

    // 3. Check if user already exists in this tenant schema
    const existing = await tenantContext.models.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email is already in use in this company.' });
    }

    // 4. Create user with role 'admin' inside tenant schema
    const user = await tenantContext.models.User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Company admin added successfully.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Create tenant admin error:', error);
    res.status(500).json({ success: false, error: `Failed to add company admin: ${error.message}` });
  }
};

// ─── List Tenant Admins ──────────────────────────────────────────────────────
exports.listTenantAdmins = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find tenant in master DB
    const tenant = await db.Tenant.findByPk(id);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found.' });
    }

    // 2. Resolve tenant connection & database model dynamically
    const { getTenantConnection } = require('../utils/tenantConnectionManager');
    const tenantContext = await getTenantConnection(tenant.schema_name);

    // 3. Find all users in this tenant schema with role 'admin'
    const admins = await tenantContext.models.User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'is_active', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('List tenant admins error:', error);
    res.status(500).json({ success: false, error: `Failed to fetch company admins: ${error.message}` });
  }
};


