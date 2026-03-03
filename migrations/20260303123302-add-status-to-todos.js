"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Todos", "status", {
      type: Sequelize.ENUM("Pending", "Started", "Completed"),
      allowNull: false,
      defaultValue: "Pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Todos", "status");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Todos_status";'
    );
  },
};