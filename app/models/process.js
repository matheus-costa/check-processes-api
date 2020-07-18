'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Process extends Model { };
  Process.init({
    code: DataTypes.STRING,
    type: DataTypes.STRING,
    interested: DataTypes.STRING,
    registerDate: DataTypes.DATE,
    urlQuery: DataTypes.STRING,
    lastQuery: {type: DataTypes.DATE, defaultValue: new Date() },
    status: { type: DataTypes.ENUM('OPEN', 'PAUSED', 'CLOSED'), defaultValue: 'OPEN' },
    lastDocument: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Process',
  });
  return Process;
};