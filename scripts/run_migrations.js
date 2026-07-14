require('dotenv').config();
const { Sequelize } = require('sequelize');
const { setupTenantSchema } = require('../utils/schemaMigrator');
const db = require('../models');

async function runAllMigrations() {
  try {
    // Sync master database models first (creates tenants and admins tables in master DB if not exist)
    console.log('[Migration Runner] Synchronizing master database...');
    await db.sequelize.sync();
    console.log('[Migration Runner] Master database synchronized.');

    // Fetch all active tenants from master DB
    const tenants = await db.Tenant.findAll({ where: { is_active: true } });
    console.log(`[Migration Runner] Found ${tenants.length} active tenant(s) to migrate.`);

    for (const tenant of tenants) {
      console.log(`\n========================================`);
      console.log(`Migrating Tenant: ${tenant.name} (${tenant.schema_name})`);
      console.log(`========================================`);
      await setupTenantSchema(tenant.schema_name);
    }

    console.log('\n🎉 All tenant migrations executed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration runner failed:', error);
    process.exit(1);
  }
}

runAllMigrations();
