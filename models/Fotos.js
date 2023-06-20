const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Foto = sequelize.define('Foto', {
  jpg: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'fotos' 
});

//Post.sync({ force: true })
module.exports = Foto;
