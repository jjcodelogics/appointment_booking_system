'use strict';

const now = new Date();

const genders = ['male', 'female'];
const bools = [true, false];

const services = [];

for (const gender of genders) {
  for (const washing of bools) {
    for (const cutting of bools) {
      for (const coloring of bools) {
        // At least one service must be true
        if (washing || cutting || coloring) {
          services.push({
            gender_target: gender,
            washing,
            cutting,
            coloring,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
  }
}

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('services', services, {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('appointments', null, {}); // Delete appointments first
  await queryInterface.bulkDelete('services', null, {}); // Then delete services
}
