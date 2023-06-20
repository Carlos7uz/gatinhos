const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('gato', 'root', 'root', {
  host: "localhost",
  dialect: 'mysql'
});

module.exports = {
  Sequelize,
  sequelize,
  DataTypes
};