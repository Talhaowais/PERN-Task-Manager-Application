// migrations/20260303-add-todo-user-columns.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1️⃣ Add createdBy column (NOT NULL)
    await queryInterface.addColumn('Todos', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // TEMP: set a default user ID for existing rows (adjust if needed)
    });

    // 2️⃣ Add updatedBy column (NULLABLE)
    await queryInterface.addColumn('Todos', 'updatedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 3️⃣ Add assignedTo column (NULLABLE)
    await queryInterface.addColumn('Todos', 'assignedTo', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 4️⃣ (Optional) Add foreign key constraints to Users table
    await queryInterface.addConstraint('Todos', {
      fields: ['createdBy'],
      type: 'foreign key',
      name: 'fk_todos_createdBy',
      references: { table: 'Users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET DEFAULT',
    });

    await queryInterface.addConstraint('Todos', {
      fields: ['updatedBy'],
      type: 'foreign key',
      name: 'fk_todos_updatedBy',
      references: { table: 'Users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('Todos', {
      fields: ['assignedTo'],
      type: 'foreign key',
      name: 'fk_todos_assignedTo',
      references: { table: 'Users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: remove new columns and constraints
    await queryInterface.removeConstraint('Todos', 'fk_todos_createdBy');
    await queryInterface.removeConstraint('Todos', 'fk_todos_updatedBy');
    await queryInterface.removeConstraint('Todos', 'fk_todos_assignedTo');

    await queryInterface.removeColumn('Todos', 'createdBy');
    await queryInterface.removeColumn('Todos', 'updatedBy');
    await queryInterface.removeColumn('Todos', 'assignedTo');
  },
};