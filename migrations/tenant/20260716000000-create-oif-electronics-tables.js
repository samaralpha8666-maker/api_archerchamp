'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;

    // Create oif_orders table
    await queryInterface.createTable('oif_orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      oif_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      po_no: {
        type: Sequelize.STRING,
        allowNull: true
      },
      order_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      dispatch_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      customer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_no: {
        type: Sequelize.STRING,
        allowNull: true
      },
      billing: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      shipping: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      products: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      pole: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'No'
      },
      printer: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'No'
      },
      stamping: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'No'
      },
      transport: {
        type: Sequelize.STRING,
        allowNull: true
      },
      courier: {
        type: Sequelize.STRING,
        allowNull: true
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      prepared_by: {
        type: Sequelize.STRING,
        allowNull: false
      },
      prep_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      sign: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_by_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'users',
            schema: schema
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    }, { schema });

    // Create electronics_boards table
    await queryInterface.createTable('electronics_boards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ADRA'
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'VER-1.0'
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Vasai Factory'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      min_qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE')
      },
      parts: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    }, { schema });

    // Indexes
    await queryInterface.addIndex({ tableName: 'oif_orders', schema }, ['created_by_id']);
    await queryInterface.addIndex({ tableName: 'oif_orders', schema }, ['oif_no']);
  },

  down: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;
    await queryInterface.dropTable('electronics_boards', { schema });
    await queryInterface.dropTable('oif_orders', { schema });
  }
};
