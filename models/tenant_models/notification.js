const { DataTypes } = require('sequelize');

module.exports = (sequelize, schemaName) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'alert'
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'primary'
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    schema: schemaName,
    tableName: 'notifications',
    timestamps: true,
    underscored: true
  });

  return Notification;
};
