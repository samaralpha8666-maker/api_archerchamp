const { Umzug, SequelizeStorage } = require('umzug');
const { Sequelize } = require('sequelize');
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

/**
 * Programmatically creates a schema and runs migrations on it.
 * @param {string} schemaName - Target database schema name
 */
async function setupTenantSchema(schemaName) {
  // 1. Create the schema in the database using root connection
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false
  });

  try {
    await sequelize.authenticate();
    
    // Create schema if not exists
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log(`[SchemaMigrator] Schema "${schemaName}" created or already exists.`);

    // 2. Setup schema-specific Sequelize instance for Umzug migrations
    const tenantSequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: false,
      searchPath: schemaName,
      schema: schemaName
    });

    const umzug = new Umzug({
      migrations: {
        glob: path.join(__dirname, '..', 'migrations', 'tenant', '*.js'),
        resolve: ({ name, path: migrationPath, context }) => {
          const migration = require(migrationPath);
          return {
            name,
            up: async () => {
              const queryInterface = context;
              queryInterface.sequelize.options.schema = schemaName;
              return migration.up(queryInterface, Sequelize);
            },
            down: async () => {
              const queryInterface = context;
              queryInterface.sequelize.options.schema = schemaName;
              return migration.down(queryInterface, Sequelize);
            }
          };
        }
      },
      context: tenantSequelize.getQueryInterface(),
      storage: new SequelizeStorage({
        sequelize: tenantSequelize,
        schema: schemaName,
        tableName: 'SequelizeMeta'
      }),
      logger: console
    });

    // Run migrations
    console.log(`[SchemaMigrator] Running migrations for schema "${schemaName}"...`);
    await umzug.up();
    console.log(`[SchemaMigrator] Migrations completed successfully for schema "${schemaName}".`);

    await tenantSequelize.close();
  } catch (error) {
    console.error(`[SchemaMigrator] Failed to setup schema ${schemaName}:`, error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

module.exports = {
  setupTenantSchema
};
