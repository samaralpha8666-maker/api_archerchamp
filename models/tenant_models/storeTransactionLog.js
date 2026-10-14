const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const StoreTransactionLog = sequelize.define('StoreTransactionLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'item_id'
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'item_name'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'INITIAL_ENTRY',
      field: 'type' // 'INITIAL_ENTRY', 'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'DELETE'
    },
    qtyChange: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'qty_change'
    },
    finalQty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'final_qty'
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'reason'
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'reference'
    },
    operatorName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'operator_name'
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Vasai Factory (HQ)',
      field: 'branch'
    }
  }, {
    schema: schemaName,
    tableName: 'store_transaction_logs',
    timestamps: true,
    underscored: true
  });

  return StoreTransactionLog;
};
