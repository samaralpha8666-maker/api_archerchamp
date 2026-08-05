const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const OimlRecord = sequelize.define('OimlRecord', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    maxCap: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'max_cap'
    },
    maxUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'g',
      field: 'max_unit'
    },
    readability: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    readUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'mg',
      field: 'read_unit'
    },
    displayUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'g',
      field: 'display_unit'
    },
    oimlClass: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'oiml_class'
    },
    minG: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'min_g'
    },
    uspMinG: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'usp_min_g'
    },
    uspMaxG: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'usp_max_g'
    },
    mpeRanges: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'mpe_ranges'
    }
  }, {
    schema: schemaName,
    tableName: 'oiml_records',
    timestamps: true,
    underscored: true
  });

  return OimlRecord;
};
