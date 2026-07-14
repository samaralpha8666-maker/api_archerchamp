require('dotenv').config();
const { setupTenantSchema } = require('./utils/schemaMigrator');
const db = require('./models');

const { Client } = require('pg');

async function testBoilerplate() {
  console.log('⚡ Starting validation test for Multi-Tenant Boilerplate...');

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
      console.log(`[Test] Database "${dbName}" not found. Creating it dynamically...`);
      await pgClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`[Test] Database "${dbName}" created successfully.`);
    }
    await pgClient.end();

    // 2. Sync master tables
    console.log('[Test] Syncing master database models...');
    await db.sequelize.sync({ force: true });
    console.log('[Test] Master database synced successfully.');

    // 2. Setup Super Admin
    console.log('[Test] Registering test Super Admin...');
    const admin = await db.Admin.create({
      name: 'Test Administrator',
      email: 'testadmin@boilerplate.com',
      password: 'testadminpassword'
    });
    console.log('[Test] Super Admin registered:', admin.email);

    // 3. Register a test tenant (onboard)
    console.log('[Test] Registering new tenant "Acme Business"...');
    const subdomain = 'acme';
    const schema_name = 'tenant_acme';

    const tenant = await db.Tenant.create({
      name: 'Acme Business Corp',
      subdomain,
      schema_name,
      settings: { plan: 'enterprise' }
    });
    console.log('[Test] Tenant recorded in master DB. Schema name:', tenant.schema_name);

    // 4. Provision schema and run migrations dynamically
    console.log('[Test] Provisioning isolated database schema and running migrations...');
    await setupTenantSchema(schema_name);
    console.log('[Test] Schema provisioning successful.');

    // 5. Connect to the dynamic tenant schema and test operations
    const { getTenantConnection } = require('./utils/tenantConnectionManager');
    const tenantContext = await getTenantConnection(schema_name);

    console.log('[Test] Registering a tenant user inside Acme schema...');
    const user = await tenantContext.models.User.create({
      name: 'John Doe',
      email: 'john@acme.com',
      password: 'johnpassword',
      role: 'admin'
    });
    console.log('[Test] Tenant user registered successfully:', user.email);

    console.log('[Test] Creating an isolated document inside Acme schema...');
    const doc = await tenantContext.models.Document.create({
      title: 'Q1 Financial Summary',
      content: 'Confidential corporate earnings for Q1.',
      created_by_id: user.id
    });
    console.log('[Test] Isolated document created successfully:', doc.title);

    // Verify retrieval
    const docs = await tenantContext.models.Document.findAll({
      where: { created_by_id: user.id }
    });
    if (docs.length === 1 && docs[0].title === 'Q1 Financial Summary') {
      console.log('✅ Success! Isolated document retrieval verified.');
    } else {
      throw new Error('Verification failed: Document was not retrieved correctly.');
    }

    console.log('\n🎉 ALL BOILERPLATE SYSTEM TESTS PASSED SUCCESSFULLY!');
    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Boilerplate validation failed:', error);
    process.exit(1);
  }
}

testBoilerplate();
