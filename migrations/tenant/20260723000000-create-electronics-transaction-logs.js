'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;

    await queryInterface.createTable('electronics_transaction_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      board_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'electronics_boards',
            schema: schema
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ref: {
        type: Sequelize.STRING,
        allowNull: true
      },
      operator_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parts_snapshot: {
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
  },

  down: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;
    await queryInterface.dropTable('electronics_transaction_logs', { schema });
  }
};
