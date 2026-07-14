const { Sequelize } = require('sequelize');
const initTenantModels = require('../models/tenant_models');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

// In-memory cache for dynamic schema models
// Structure: { [schemaName]: { connection, models } }
const tenantCache = {};

// Root connection pool
let rootSequelizeInstance = null;

function getRootConnection() {
  if (!rootSequelizeInstance) {
    rootSequelizeInstance = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: config.logging,
      pool: config.pool,
      dialectOptions: config.dialectOptions
    });
  }
  return rootSequelizeInstance;
}

/**
 * Resolves or establishes connection context for a given tenant schema.
 * @param {string} schemaName - The database schema name.
 * @returns {Promise<{sequelize: Sequelize, models: object}>}
 */
async function getTenantConnection(schemaName) {
  if (tenantCache[schemaName]) {
    return tenantCache[schemaName];
  }

  // Create a new Sequelize instance targeted to this specific schema
  const tenantSequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    searchPath: schemaName,
    schema: schemaName,
    dialectOptions: config.dialectOptions,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

  // Bind models to the connection and schema
  const models = initTenantModels(tenantSequelize, schemaName);

  // Store in cache
  tenantCache[schemaName] = {
    sequelize: tenantSequelize,
    models
  };

  return tenantCache[schemaName];
}

module.exports = {
  getRootConnection,
  getTenantConnection
};
