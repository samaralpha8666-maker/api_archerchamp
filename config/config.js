require('dotenv').config();

let dbConfig = {
  dialect: 'postgres',
  logging: false
};

if (process.env.DATABASE_URL) {
  try {
    const { URL } = require('url');
    const parsed = new URL(process.env.DATABASE_URL);
    dbConfig.username = decodeURIComponent(parsed.username);
    dbConfig.password = decodeURIComponent(parsed.password);
    dbConfig.host = parsed.hostname;
    dbConfig.port = parsed.port ? parseInt(parsed.port, 10) : 5432;
    dbConfig.database = decodeURIComponent(parsed.pathname.substring(1));
    
    // Auto-detect SSL requirement
    const sslmode = parsed.searchParams.get('sslmode');
    if (sslmode === 'require' || sslmode === 'true' || process.env.DB_SSL === 'true' || parsed.hostname.includes('.neon.tech')) {
      dbConfig.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      };
    }
  } catch (err) {
    console.error('Failed to parse DATABASE_URL, falling back to individual env variables:', err);
  }
}

// Fallback to individual variables if not populated by DATABASE_URL
dbConfig.username = dbConfig.username || process.env.DB_USERNAME || 'postgres';
dbConfig.password = dbConfig.password || process.env.DB_PASSWORD || 'Asdf@123';
dbConfig.database = dbConfig.database || process.env.DB_NAME || 'multi_tenant_base';
dbConfig.host = dbConfig.host || process.env.DB_HOST || '127.0.0.1';
dbConfig.port = dbConfig.port || process.env.DB_PORT || 5432;

if ((process.env.DB_SSL === 'true') && !dbConfig.dialectOptions) {
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

module.exports = {
  development: {
    ...dbConfig
  },
  production: {
    ...dbConfig,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
