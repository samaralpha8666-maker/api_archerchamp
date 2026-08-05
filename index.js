require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const db = require('./models');
const masterRoutes = require('./routes/masterRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const publicRoutes = require('./routes/publicRoutes');

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

// ─── Modular Router Mounts ────────────────────────────────────────────────────
app.use('/api/master', masterRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api', publicRoutes);


// ─── Error Handling Middleware ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const { setupTenantSchema } = require('./utils/schemaMigrator');

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

    // 4. Automatically run schema migrations for all active tenants on startup
    try {
      console.log('[App Startup] Running tenant schema migrations...');
      const tenants = await db.Tenant.findAll({ where: { is_active: true } });
      for (const tenant of tenants) {
        console.log(`[App Startup] Auto-migrating tenant schema: ${tenant.schema_name}`);
        await setupTenantSchema(tenant.schema_name);
      }
      console.log('[App Startup] All tenant schema migrations applied.');
    } catch (migErr) {
      console.error('[App Startup] Non-fatal tenant migration log:', migErr.message);
    }

    // 5. Start listening
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
