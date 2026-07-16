const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const Brand = sequelize.define('Brand', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    schema: schemaName,
    tableName: 'brands',
    timestamps: true,
    underscored: true
  });

  return Brand;
};
