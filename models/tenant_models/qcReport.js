const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const QcReport = sequelize.define(
    'QcReport',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false
      },
      srNo: {
        type: DataTypes.STRING,
        field: 'sr_no',
        allowNull: false
      },
      capacity: {
        type: DataTypes.STRING,
        allowNull: true
      },
      swVer: {
        type: DataTypes.STRING,
        field: 'sw_ver',
        allowNull: true
      },
      readability: {
        type: DataTypes.STRING,
        allowNull: true
      },
      interval: {
        type: DataTypes.STRING,
        allowNull: true
      },
      calWt: {
        type: DataTypes.STRING,
        field: 'cal_wt',
        allowNull: true
      },
      issueDate: {
        type: DataTypes.DATEONLY,
        field: 'issue_date',
        allowNull: false
      },
      testedBy: {
        type: DataTypes.STRING,
        field: 'tested_by',
        allowNull: false
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'QC Engineer'
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'submitted'
      },
      eccPoints: {
        type: DataTypes.JSON,
        field: 'ecc_points',
        allowNull: true
      },
      creepReadings: {
        type: DataTypes.JSON,
        field: 'creep_readings',
        allowNull: true
      },
      creepDiff: {
        type: DataTypes.STRING,
        field: 'creep_diff',
        allowNull: true
      },
      repeatLoad: {
        type: DataTypes.STRING,
        field: 'repeat_load',
        allowNull: true
      },
      repeatTol: {
        type: DataTypes.STRING,
        field: 'repeat_tol',
        allowNull: true
      },
      repeatRows: {
        type: DataTypes.JSON,
        field: 'repeat_rows',
        allowNull: true
      },
      repeatMaxDiff: {
        type: DataTypes.STRING,
        field: 'repeat_max_diff',
        allowNull: true
      },
      repeatSD: {
        type: DataTypes.STRING,
        field: 'repeat_sd',
        allowNull: true
      },
      linRows: {
        type: DataTypes.JSON,
        field: 'lin_rows',
        allowNull: true
      },
      linMaxDiff: {
        type: DataTypes.STRING,
        field: 'lin_max_diff',
        allowNull: true
      }
    },
    {
      schema: schemaName,
      tableName: 'qc_reports',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return QcReport;
};
