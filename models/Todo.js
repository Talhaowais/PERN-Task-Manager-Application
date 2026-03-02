const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Todo = sequelize.define("Todo", {
  task: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {                     //  Added userId
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Todo;