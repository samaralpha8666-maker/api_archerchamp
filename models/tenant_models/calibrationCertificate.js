const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const CalibrationCertificate = sequelize.define(
    'CalibrationCertificate',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      ulrNo: {
        type: DataTypes.STRING,
        field: 'ulr_no',
        allowNull: true
      },
      calDate: {
        type: DataTypes.DATEONLY,
        field: 'cal_date',
        allowNull: false
      },
      nextDue: {
        type: DataTypes.DATEONLY,
        field: 'next_due',
        allowNull: false
      },
      labLocation: {
        type: DataTypes.STRING,
        field: 'lab_location',
        allowNull: false,
        defaultValue: 'Vasai Laboratory'
      },
      customer: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      instrument: {
        type: DataTypes.STRING,
        allowNull: false
      },
      serial: {
        type: DataTypes.STRING,
        allowNull: false
      },
      range: {
        type: DataTypes.STRING,
        allowNull: true
      },
      leastCount: {
        type: DataTypes.STRING,
        field: 'least_count',
        allowNull: true
      },
      refStd: {
        type: DataTypes.STRING,
        field: 'ref_std',
        allowNull: true
      },
      stdCert: {
        type: DataTypes.STRING,
        field: 'std_cert',
        allowNull: true
      },
      env: {
        type: DataTypes.STRING,
        allowNull: true
      },
      readings: {
        type: DataTypes.JSON,
        allowNull: true
      },
      result: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pass'
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      calBy: {
        type: DataTypes.STRING,
        field: 'cal_by',
        allowNull: false
      },
      approvedBy: {
        type: DataTypes.STRING,
        field: 'approved_by',
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'completed'
      }
    },
    {
      schema: schemaName,
      tableName: 'calibration_certificates',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return CalibrationCertificate;
};
