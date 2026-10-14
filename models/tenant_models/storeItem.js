const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const StoreItem = sequelize.define('StoreItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'item_name'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'quantity'
    },
    toleranceLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      field: 'tolerance_limit'
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Vasai Factory (HQ)',
      field: 'branch'
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Pcs',
      field: 'unit'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'General',
      field: 'category'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'location'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'notes'
    }
  }, {
    schema: schemaName,
    tableName: 'store_items',
    timestamps: true,
    underscored: true
  });

  return StoreItem;
};
