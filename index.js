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
app.post('/api/master/tenants', authenticateMasterAdmin, masterController.createTenant);
app.get('/api/master/tenants', authenticateMasterAdmin, masterController.listTenants);

// ─── Tenant-Scoped Routes (Tenant Resolver Middleware Required) ──────────────
app.post('/api/tenant/signup', tenantResolver, tenantController.signup);
app.post('/api/tenant/login', tenantResolver, tenantController.login);

// Authenticated Tenant Routes
app.post('/api/tenant/documents', tenantResolver, authenticateTenantUser, tenantController.createDocument);
app.get('/api/tenant/documents', tenantResolver, authenticateTenantUser, tenantController.listDocuments);

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

  // Parse connection string to target postgres default database first
  const pgClient = new Client({
    connectionString: connectionString.replace(new RegExp(`/${dbName}$`), '/postgres')
  });

  try {
    // 1. Connect to postgres default DB and verify/create application DB
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

    // 2. Synchronize Master Models (Tenants & Admins tables)
    console.log('[App Startup] Synchronizing master database schemas...');
    await db.sequelize.sync();
    console.log('[App Startup] Master database synchronized.');

    // 3. Setup Default Super Admin if none exists
    const adminCount = await db.Admin.count();
    if (adminCount === 0) {
      console.log('[App Startup] Creating default Super Admin account: admin@boilerplate.com / admin123');
      await db.Admin.create({
        name: 'Default Super Admin',
        email: 'admin@boilerplate.com',
        password: 'admin123'
      });
      console.log('[App Startup] Default Super Admin created.');
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
