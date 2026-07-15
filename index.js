require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const db = require('./models');
const tenantResolver = require('./middleware/tenantResolver');
const { authenticateTenantUser, authenticateMasterAdmin } = require('./middleware/auth');

const masterController = require('./controllers/masterController');
const tenantController = require('./controllers/tenantController');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Base Multi-Tenant API is healthy.',
    timestamp: new Date().toISOString()
  });
});

// ─── Master / Super Admin Routes ─────────────────────────────────────────────
app.post('/api/master/login', masterController.adminLogin);
app.post('/api/master/register', masterController.createAdmin);
app.post('/api/master/tenants', authenticateMasterAdmin, masterController.createTenant);
app.get('/api/master/tenants', authenticateMasterAdmin, masterController.listTenants);
app.put('/api/master/profile', authenticateMasterAdmin, masterController.updateMasterProfile);

// ─── Public Tenants Route (For frontend login/tenant dropdown) ───────────────
app.get('/api/tenants', async (req, res) => {
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

// ─── Verify Token (Check session validity for Super Admin and Tenant User) ───
app.get('/api/verify_token', async (req, res) => {
  const jwt = require('jsonwebtoken');
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
      // Find tenant inside master database
      const tenant = await db.Tenant.findByPk(decoded.tenantId);
      if (!tenant || !tenant.is_active) {
        return res.status(401).json({ success: false, error: 'Tenant inactive or not found.' });
      }

      // Resolve tenant connection & database model dynamically
      const { getTenantConnection } = require('./utils/tenantConnectionManager');
      const tenantContext = await getTenantConnection(tenant.schema_name);
      
      const user = await tenantContext.models.User.findByPk(decoded.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({ success: false, error: 'User account not found or deactivated.' });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: tenant.id,
            tenantSubdomain: tenant.subdomain,
            school_name: tenant.name // map to school_name for layout title consistency
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

// ─── Tenant-Scoped Routes (Tenant Resolver Middleware Required) ──────────────
app.post('/api/tenant/signup', tenantResolver, tenantController.signup);
app.post('/api/tenant/login', tenantResolver, tenantController.login);

// Authenticated Tenant Routes
app.post('/api/tenant/documents', tenantResolver, authenticateTenantUser, tenantController.createDocument);
app.get('/api/tenant/documents', tenantResolver, authenticateTenantUser, tenantController.listDocuments);
app.put('/api/tenant/profile', tenantResolver, authenticateTenantUser, tenantController.updateTenantProfile);


// ─── Error Handling Middleware ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// ─── Auto-Create Database & Server Initialization ────────────────────────────
async function initializeApp() {
  const dbName = process.env.DB_NAME || 'multi_tenant_base';
  const connectionString = process.env.DATABASE_URL || `postgresql://postgres:Asdf%40123@localhost:5432/${dbName}`;

  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const skipCreate = process.env.DB_SKIP_CREATE === 'true' || !isLocalhost;

  try {
    if (!skipCreate) {
      console.log('[Database] Checking / creating database dynamically on localhost...');
      // Parse connection string to target postgres default database first
      const pgClient = new Client({
        connectionString: connectionString.replace(new RegExp(`/${dbName}(?:\\?.+)?$`), '/postgres')
      });
      await pgClient.connect();
      const result = await pgClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
      
      if (result.rowCount === 0) {
        console.log(`[Database] Database "${dbName}" not found. Creating it dynamically...`);
        // Run raw CREATE DATABASE query
        await pgClient.query(`CREATE DATABASE "${dbName}"`);
        console.log(`[Database] Database "${dbName}" created successfully.`);
      } else {
        console.log(`[Database] Database "${dbName}" exists.`);
      }
      await pgClient.end();
    } else {
      console.log(`[Database] Skipping dynamic database creation step (connecting directly to: ${dbName}).`);
    }

    // 2. Synchronize Master Models (Tenants & Admins tables)
    console.log('[App Startup] Synchronizing master database schemas...');
    await db.sequelize.sync();
    console.log('[App Startup] Master database synchronized.');

    // 3. Setup Default Super Admin or update password
    const admin = await db.Admin.findOne({ where: { email: 'superadmin866@gmail.com' } });
    if (!admin) {
      console.log('[App Startup] Creating default Super Admin account: superadmin866@gmail.com / Samar@!8318520053');
      await db.Admin.create({
        name: 'Default Super Admin',
        email: 'superadmin866@gmail.com',
        password: 'Samar@!8318520053'
      });
      console.log('[App Startup] Default Super Admin created.');
    } else {
      console.log('[App Startup] Ensuring default Super Admin password is set to Samar@!8318520053...');
      admin.password = 'Samar@!8318520053';
      await admin.save();
      console.log('[App Startup] Default Super Admin password updated successfully.');
    }

    // 4. Start listening
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Base Multi-Tenant API server running on port: ${PORT}`);
      console.log(`📍 Health Check: http://localhost:${PORT}/health`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize application database on startup:', error);
    process.exit(1);
  }
}

initializeApp();
