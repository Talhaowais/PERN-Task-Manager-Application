const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  profileImage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  pronoun: {
    type: DataTypes.STRING,
    allowNull: true,
  }

}, {
  timestamps: true,
});

module.exports = User;