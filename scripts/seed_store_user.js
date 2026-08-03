require('dotenv').config();
const db = require('../models');
const { getTenantConnection } = require('../utils/tenantConnectionManager');

async function seedStoreUser() {
  try {
    console.log('[Store Seed] Syncing database models...');
    await db.sequelize.sync();

    // Fetch active tenant (e.g. tenant_archerchem or first active tenant)
    const tenant = await db.Tenant.findOne({ where: { is_active: true } });
    if (!tenant) {
      console.error('❌ No active tenant found.');
      process.exit(1);
    }

    console.log(`[Store Seed] Target Tenant: ${tenant.name} (${tenant.schema_name})`);
    const tenantContext = await getTenantConnection(tenant.schema_name);
    const tenantModels = tenantContext.models;

    const storeEmail = 'store866@gmail.com';
    const storePassword = 'StoreUser@123';

    let user = await tenantModels.User.findOne({ where: { email: storeEmail } });

    if (user) {
      user.role = 'store';
      user.department = 'Store & Operations';
      user.permissions = ['dashboard', 'store'];
      user.password = storePassword; // Hook hashes password
      await user.save();
      console.log(`✅ Existing user updated to Store Role successfully!`);
    } else {
      user = await tenantModels.User.create({
        name: 'Store Manager',
        email: storeEmail,
        password: storePassword,
        role: 'store',
        department: 'Store & Operations',
        permissions: ['dashboard', 'store'],
        is_active: true
      });
      console.log(`✅ New Store Account created successfully!`);
    }

    console.log('\n========================================');
    console.log('📦 STORE USER CREDENTIALS');
    console.log('========================================');
    console.log(`Select Company : ${tenant.name}`);
    console.log(`Email          : ${storeEmail}`);
    console.log(`Password       : ${storePassword}`);
    console.log(`Role           : Store (Access: Dashboard & Store)`);
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating store user:', err);
    process.exit(1);
  }
}

seedStoreUser();
