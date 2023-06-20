const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

const Post = sequelize.define('donos', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adm: {
    type: DataTypes.STRING,
    defaultValue: '0'
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
});

module.exports = Post;


//Post.sync({ force: true })
  
