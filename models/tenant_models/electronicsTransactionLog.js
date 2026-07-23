const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const ElectronicsTransactionLog = sequelize.define('ElectronicsTransactionLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    boardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'board_id',
      references: {
        model: 'electronics_boards',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ref: {
      type: DataTypes.STRING,
      allowNull: true
    },
    operatorName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'operator_name'
    },
    partsSnapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'parts_snapshot'
    }
  }, {
    schema: schemaName,
    tableName: 'electronics_transaction_logs',
    timestamps: true
  });

  return ElectronicsTransactionLog;
};
