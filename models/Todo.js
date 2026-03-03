// models/Todo.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User"); // Import User for associations

const Todo = sequelize.define(
  "Todo",
  {
    task: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    createdBy: { // User ID of creator
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    updatedBy: { // User ID of last updater
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    assignedTo: { // User ID assigned to this task
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ---------- ASSOCIATIONS ---------- */

// Who is assigned to this todo
Todo.belongsTo(User, {
  foreignKey: "assignedTo",
  as: "assignedUser",
});

// Who created this todo
Todo.belongsTo(User, {
  foreignKey: "createdBy",
  as: "createdByUser",
});

// Who updated this todo last
Todo.belongsTo(User, {
  foreignKey: "updatedBy",
  as: "updatedByUser",
});

module.exports = Todo;