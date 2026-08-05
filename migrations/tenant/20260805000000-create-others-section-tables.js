const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Stamping Applications Table
    await queryInterface.createTable('stamping_applications', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      app_no: {
        type: DataTypes.STRING,
        allowNull: true
      },
      to: {
        type: DataTypes.STRING,
        allowNull: true
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mfg_lic: {
        type: DataTypes.STRING,
        allowNull: true
      },
      dlr_lic: {
        type: DataTypes.STRING,
        allowNull: true
      },
      rep_lic: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lcr_no: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cheque_ref: {
        type: DataTypes.STRING,
        allowNull: true
      },
      grand_total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      rows: {
        type: DataTypes.JSON,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
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

    // 2. OIML Calculation Records Table
    await queryInterface.createTable('oiml_records', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      max_cap: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      max_unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'g'
      },
      readability: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      read_unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'mg'
      },
      display_unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'g'
      },
      oiml_class: {
        type: DataTypes.STRING,
        allowNull: false
      },
      min_g: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      usp_min_g: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      usp_max_g: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      mpe_ranges: {
        type: DataTypes.JSON,
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

    // 3. Notifications Table
    await queryInterface.createTable('notifications', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'alert'
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'primary'
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('oiml_records');
    await queryInterface.dropTable('stamping_applications');
  }
};
