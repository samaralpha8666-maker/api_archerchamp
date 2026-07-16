'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;

    // Add branch column to oif_orders table
    await queryInterface.addColumn(
      { tableName: 'oif_orders', schema },
      'branch',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Vasai Factory (HQ)'
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;
    await queryInterface.removeColumn({ tableName: 'oif_orders', schema }, 'branch');
  }
};
