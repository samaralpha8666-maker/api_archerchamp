'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;

    // Create purchase_requisitions table in tenant schema
    await queryInterface.createTable(
      'purchase_requisitions',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        prNo: {
          type: Sequelize.STRING,
          allowNull: false
        },
        date: {
          type: Sequelize.STRING,
          allowNull: false
        },
        department: {
          type: Sequelize.STRING,
          allowNull: true
        },
        fulfillmentDate: {
          type: Sequelize.STRING,
          allowNull: true
        },
        preferredVendor: {
          type: Sequelize.STRING,
          allowNull: true
        },
        branch: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: 'Vasai Factory (HQ)'
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'pending'
        },
        items: {
          type: Sequelize.JSON,
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        requisitionBy: {
          type: Sequelize.STRING,
          allowNull: true
        },
        approvedBy: {
          type: Sequelize.STRING,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      },
      { schema }
    );

    await queryInterface.addIndex({ tableName: 'purchase_requisitions', schema }, ['prNo']);
  },

  down: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;
    await queryInterface.dropTable({ tableName: 'purchase_requisitions', schema });
  }
};
