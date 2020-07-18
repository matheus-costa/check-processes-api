'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Processes', {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      code: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      interested: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      registerDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      urlQuery: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      lastQuery: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('OPEN', 'PAUSED', 'CLOSED'),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Processes');
  }
};
