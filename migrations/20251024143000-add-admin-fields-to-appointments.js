'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  // Add admin-related fields to appointments table
  await queryInterface.addColumn('Appointments', 'status', {
    type: Sequelize.STRING,
    defaultValue: 'confirmed',
    allowNull: false,
  });

  await queryInterface.addColumn('Appointments', 'customer_name', {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('Appointments', 'customer_phone', {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('Appointments', 'staff_assigned', {
    type: Sequelize.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  // Remove the columns in reverse order
  await queryInterface.removeColumn('Appointments', 'staff_assigned');
  await queryInterface.removeColumn('Appointments', 'customer_phone');
  await queryInterface.removeColumn('Appointments', 'customer_name');
  await queryInterface.removeColumn('Appointments', 'status');
}
