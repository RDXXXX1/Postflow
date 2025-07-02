const { DataTypes } = require('sequelize');
const {sequelize} = require('../models/db.js'); 

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  displayName: {
    type: DataTypes.STRING,
  },
  picture: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'users',     
  timestamps: false,      
});

module.exports = User;
