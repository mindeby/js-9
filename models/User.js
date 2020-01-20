'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
          notEmpty: {
            msg: 'A first Name is required'
          }
      }
    },
    lastName: {
      type: Sequelize.STRING,
      validate: {
          notEmpty: {
            msg: 'A last Name is required'
          }
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      validate: {
          notEmpty: {
            msg: 'An Email Address is required'
          }
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
          notEmpty: {
            msg: 'A password is required'
          }
      }
    },
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: "User", 
      foreignKey: {
        fieldName: "userId",
        allowNull: false,
      },
    });
  };
  return User;
};
