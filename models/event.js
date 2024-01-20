const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    event_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    event_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    event_description: {
      type: DataTypes.TEXT,
    },
    event_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    organizer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, 
        key: 'user_id',
    },
    },
  }, {
    tableName: 'events',
    timestamps: false, 
  });
  
  module.exports = Event;
