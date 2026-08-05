const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const StampingApplication = sequelize.define('StampingApplication', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    appNo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'app_no'
    },
    to: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mfgLic: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mfg_lic'
    },
    dlrLic: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'dlr_lic'
    },
    repLic: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'rep_lic'
    },
    lcrNo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'lcr_no'
    },
    chequeRef: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'cheque_ref'
    },
    grandTotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'grand_total'
    },
    rows: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    schema: schemaName,
    tableName: 'stamping_applications',
    timestamps: true,
    underscored: true
  });

  return StampingApplication;
};
