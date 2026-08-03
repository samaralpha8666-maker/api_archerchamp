const defineUser = require('./user.js');
const defineDocument = require('./document.js');
const defineOifOrder = require('./oifOrder.js');
const defineElectronicsBoard = require('./electronicsBoard.js');
const defineElectronicsTransactionLog = require('./electronicsTransactionLog.js');
const defineBranch = require('./branch.js');
const defineBrand = require('./brand.js');
const definePurchaseRequisition = require('./purchaseRequisition.js');

/**
 * Initializes and binds models dynamically to a specific tenant schema context.
 * @param {Sequelize} sequelize - The Sequelize connection instance.
 * @param {string} schemaName - The database schema name.
 * @returns {object} - Bounded models.
 */
function initTenantModels(sequelize, schemaName) {
  const models = {};

  // Register models with the custom schemaName
  models.User = defineUser(sequelize, schemaName);
  models.Document = defineDocument(sequelize, schemaName);
  models.OifOrder = defineOifOrder(sequelize, schemaName);
  models.ElectronicsBoard = defineElectronicsBoard(sequelize, schemaName);
  models.ElectronicsTransactionLog = defineElectronicsTransactionLog(sequelize, schemaName);
  models.Branch = defineBranch(sequelize, schemaName);
  models.Brand = defineBrand(sequelize, schemaName);
  models.PurchaseRequisition = definePurchaseRequisition(sequelize, schemaName);

  // Setup associations between tenant models
  models.User.hasMany(models.Document, { foreignKey: 'created_by_id', as: 'documents' });
  models.Document.belongsTo(models.User, { foreignKey: 'created_by_id', as: 'creator' });

  models.User.hasMany(models.OifOrder, { foreignKey: 'created_by_id', as: 'oifOrders' });
  models.OifOrder.belongsTo(models.User, { foreignKey: 'created_by_id', as: 'creator' });

  models.ElectronicsBoard.hasMany(models.ElectronicsTransactionLog, { foreignKey: 'board_id', as: 'transactionLogs' });
  models.ElectronicsTransactionLog.belongsTo(models.ElectronicsBoard, { foreignKey: 'board_id', as: 'board' });

  return models;
}

module.exports = initTenantModels;
