'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;

    // 1. Create branches table
    await queryInterface.createTable(
      { tableName: 'branches', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false
        },
        location: {
          type: Sequelize.STRING,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'created_at'
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'updated_at'
        }
      }
    );

    // 2. Create brands table
    await queryInterface.createTable(
      { tableName: 'brands', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'created_at'
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'updated_at'
        }
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;
    await queryInterface.dropTable({ tableName: 'brands', schema });
    await queryInterface.dropTable({ tableName: 'branches', schema });
  }
};
