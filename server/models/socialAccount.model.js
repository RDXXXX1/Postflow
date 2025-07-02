const { DataTypes } = require('sequelize');
const {sequelize} = require('../models/db.js');
const User = require('./user.model');

const SocialAccount = sequelize.define('SocialAccount', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
  },
  accessToken: {
    type: DataTypes.TEXT,
  },
  refreshToken: {
    type: DataTypes.TEXT,
  },
  connectedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'social_accounts',
  timestamps: false,
});

// Define association: social accounts belong to users
SocialAccount.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(SocialAccount, { foreignKey: 'user_id' });

module.exports = SocialAccount;