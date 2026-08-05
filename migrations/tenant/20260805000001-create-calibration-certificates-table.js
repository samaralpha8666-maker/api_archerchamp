const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('calibration_certificates', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      ulr_no: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cal_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      next_due: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      lab_location: {
        type: DataTypes.STRING,
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
      least_count: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ref_std: {
        type: DataTypes.STRING,
        allowNull: true
      },
      std_cert: {
        type: DataTypes.STRING,
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
      cal_by: {
        type: DataTypes.STRING,
        allowNull: false
      },
      approved_by: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'completed'
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
    await queryInterface.dropTable('calibration_certificates');
  }
};
