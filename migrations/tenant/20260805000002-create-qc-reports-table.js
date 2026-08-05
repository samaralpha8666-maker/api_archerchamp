const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('qc_reports', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sr_no: {
        type: DataTypes.STRING,
        allowNull: false
      },
      capacity: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sw_ver: {
        type: DataTypes.STRING,
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
      cal_wt: {
        type: DataTypes.STRING,
        allowNull: true
      },
      issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      tested_by: {
        type: DataTypes.STRING,
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
      ecc_points: {
        type: DataTypes.JSON,
        allowNull: true
      },
      creep_readings: {
        type: DataTypes.JSON,
        allowNull: true
      },
      creep_diff: {
        type: DataTypes.STRING,
        allowNull: true
      },
      repeat_load: {
        type: DataTypes.STRING,
        allowNull: true
      },
      repeat_tol: {
        type: DataTypes.STRING,
        allowNull: true
      },
      repeat_rows: {
        type: DataTypes.JSON,
        allowNull: true
      },
      repeat_max_diff: {
        type: DataTypes.STRING,
        allowNull: true
      },
      repeat_sd: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lin_rows: {
        type: DataTypes.JSON,
        allowNull: true
      },
      lin_max_diff: {
        type: DataTypes.STRING,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('qc_reports');
  }
};
