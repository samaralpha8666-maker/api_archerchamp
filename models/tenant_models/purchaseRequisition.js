const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const PurchaseRequisition = sequelize.define(
    'PurchaseRequisition',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      prNo: {
        type: DataTypes.STRING,
        field: 'pr_no',
        allowNull: false
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fulfillmentDate: {
        type: DataTypes.DATEONLY,
        field: 'fulfillment_date',
        allowNull: true
      },
      preferredVendor: {
        type: DataTypes.STRING,
        field: 'preferred_vendor',
        allowNull: true
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true
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
        field: 'requisition_by',
        allowNull: false
      },
      approvedBy: {
        type: DataTypes.STRING,
        field: 'approved_by',
        allowNull: true
      }
    },
    {
      schema: schemaName,
      tableName: 'purchase_requisitions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return PurchaseRequisition;
};
