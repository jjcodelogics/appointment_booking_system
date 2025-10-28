'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  // 1. Create the 'users' table
  await queryInterface.createTable('users', {
    user_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    username_email: { type: Sequelize.STRING, unique: true, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    password: { type: Sequelize.STRING, allowNull: false },
    role: { type: Sequelize.STRING, defaultValue: 'user' },
    createdAt: { allowNull: false, type: Sequelize.DATE },
    updatedAt: { allowNull: false, type: Sequelize.DATE },
  });

  // 2. Create the 'services' table
  await queryInterface.createTable('services', {
    service_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    gender_target: { type: Sequelize.ENUM('male', 'female'), allowNull: false },
    washing: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
    cutting: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
    coloring: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
    createdAt: { allowNull: false, type: Sequelize.DATE },
    updatedAt: { allowNull: false, type: Sequelize.DATE },
  });

  // 3. Create the 'appointments' table
  await queryInterface.createTable('appointments', {
    appointment_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'user_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    service_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'services', key: 'service_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    appointment_date: { type: Sequelize.DATE, allowNull: false },
    notes: { type: Sequelize.TEXT, allowNull: true },
    createdAt: { allowNull: false, type: Sequelize.DATE },
    updatedAt: { allowNull: false, type: Sequelize.DATE },
  });
}
export async function down(queryInterface, Sequelize) {
  // Drop tables in reverse order to respect foreign key dependencies
  await queryInterface.dropTable('appointments');
  await queryInterface.dropTable('services');
  await queryInterface.dropTable('users');
}
