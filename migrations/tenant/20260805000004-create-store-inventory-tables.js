const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;

    // 1. Create store_items table in tenant schema
    await queryInterface.createTable('store_items', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      item_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      tolerance_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Vasai Factory (HQ)'
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Pcs'
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'General'
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
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
    }, { schema });

    // 2. Create store_transaction_logs table in tenant schema
    await queryInterface.createTable('store_transaction_logs', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      item_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'INITIAL_ENTRY'
      },
      qty_change: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      final_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: true
      },
      operator_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Vasai Factory (HQ)'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, { schema });
  },

  down: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;
    await queryInterface.dropTable('store_transaction_logs', { schema });
    await queryInterface.dropTable('store_items', { schema });
  }
};
