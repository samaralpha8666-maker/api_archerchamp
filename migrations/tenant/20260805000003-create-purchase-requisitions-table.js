const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('purchase_requisitions', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      pr_no: {
        type: DataTypes.STRING,
        allowNull: false
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fulfillment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      preferred_vendor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      items: {
        type: DataTypes.JSON,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      requisition_by: {
        type: DataTypes.STRING,
        allowNull: false
      },
      approved_by: {
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
    await queryInterface.dropTable('purchase_requisitions');
  }
};
