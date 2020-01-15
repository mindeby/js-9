'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: '"First Name" is required'
      }
    }
  },
    lastName: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: '"Last Name" is required'
        }
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: '"Email" is required'
        }
      }
    },
    password: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: '"password" is required'
        }
      }
    }
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course, { foreignKey: 'userId' });
  };

  return User;
};
