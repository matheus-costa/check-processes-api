'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'Processes',
      'code',
      {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => { }
};
