const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const Branch = sequelize.define('Branch', {
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
    location: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    schema: schemaName,
    tableName: 'branches',
    timestamps: true,
    underscored: true
  });

  return Branch;
};
