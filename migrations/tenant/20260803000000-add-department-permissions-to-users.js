'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;

    // Add department column to users table
    await queryInterface.addColumn(
      { tableName: 'users', schema },
      'department',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Administration'
      }
    );

    // Add permissions JSON column to users table
    await queryInterface.addColumn(
      { tableName: 'users', schema },
      'permissions',
      {
        type: Sequelize.JSON,
        allowNull: true
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;
    await queryInterface.removeColumn({ tableName: 'users', schema }, 'department');
    await queryInterface.removeColumn({ tableName: 'users', schema }, 'permissions');
  }
};
