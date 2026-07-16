const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const ElectronicsBoard = sequelize.define('ElectronicsBoard', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ADRA'
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'VER-1.0'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Vasai Factory'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    minQty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'min_qty'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    parts: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    }
  }, {
    schema: schemaName,
    tableName: 'electronics_boards',
    timestamps: true
  });

  return ElectronicsBoard;
};
