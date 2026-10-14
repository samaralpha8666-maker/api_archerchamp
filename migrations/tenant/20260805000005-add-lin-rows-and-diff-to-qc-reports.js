'use strict';

/**
 * Migration: Add lin_rows and lin_max_diff columns to qc_reports table
 * Supports 7.1.5 Linearity Test Results (TW A, TAW 1, TW B, TAW 2, TW C, A-B, A-C, Max Difference)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;
    const tableTarget = { tableName: 'qc_reports', schema };

    try {
      const tableDefinition = await queryInterface.describeTable(tableTarget);

      // 1. Add lin_rows (JSON array of 13 linearity rows) if not already existing
      if (!tableDefinition.lin_rows) {
        await queryInterface.addColumn(tableTarget, 'lin_rows', {
          type: Sequelize.JSON,
          allowNull: true
        });
        console.log(`[Migration] Added lin_rows column to schema "${schema}".qc_reports`);
      } else {
        console.log(`[Migration] Column lin_rows already exists in schema "${schema}".qc_reports`);
      }

      // 2. Add lin_max_diff (Maximum Difference string) if not already existing
      if (!tableDefinition.lin_max_diff) {
        await queryInterface.addColumn(tableTarget, 'lin_max_diff', {
          type: Sequelize.STRING,
          allowNull: true
        });
        console.log(`[Migration] Added lin_max_diff column to schema "${schema}".qc_reports`);
      } else {
        console.log(`[Migration] Column lin_max_diff already exists in schema "${schema}".qc_reports`);
      }
    } catch (err) {
      console.warn(`[Migration Warning] Could not check or add columns in schema "${schema}":`, err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const schema = queryInterface.sequelize.options.schema;
    const tableTarget = { tableName: 'qc_reports', schema };

    try {
      const tableDefinition = await queryInterface.describeTable(tableTarget);
      if (tableDefinition.lin_rows) {
        await queryInterface.removeColumn(tableTarget, 'lin_rows');
      }
      if (tableDefinition.lin_max_diff) {
        await queryInterface.removeColumn(tableTarget, 'lin_max_diff');
      }
    } catch (err) {
      console.warn(`[Migration Down Warning]:`, err.message);
    }
  }
};
