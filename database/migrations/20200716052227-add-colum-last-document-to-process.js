'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Processes',
      'lastDocument',
      {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Processes',
      'lastDocument'
    );
  }
};
