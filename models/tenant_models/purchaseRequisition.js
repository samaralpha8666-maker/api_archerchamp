const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const PurchaseRequisition = sequelize.define(
    'PurchaseRequisition',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      prNo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fulfillmentDate: {
        type: DataTypes.STRING,
        allowNull: true
      },
      preferredVendor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Vasai Factory (HQ)'
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      items: {
        type: DataTypes.JSON,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      requisitionBy: {
        type: DataTypes.STRING,
        allowNull: true
      },
      approvedBy: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: 'purchase_requisitions',
      schema: schemaName,
      timestamps: true
    }
  );

  return PurchaseRequisition;
};
