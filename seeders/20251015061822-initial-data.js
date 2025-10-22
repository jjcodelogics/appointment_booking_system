'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  const now = new Date();

  // 1. Insert Users
  // NOTE: In a real app, 'password' MUST be hashed. Your User model hook handles this.
  await queryInterface.bulkInsert('users', [
    {
      username_email: 'admin@salon.com',
      name: 'Admin User',
      password: 'secure_admin_password', // Will be hashed by the model
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    },
    {
      username_email: 'client1@email.com',
      name: 'Client One',
      password: 'client1pass', // Will be hashed by the model
      role: 'user',
      createdAt: now,
      updatedAt: now,
    },
    {
      username_email: 'client2@email.com',
      name: 'Client Two',
      password: 'client2pass', // Will be hashed by the model
      role: 'user',
      createdAt: now,
      updatedAt: now,
    }
  ], {});

  // 2. Insert Employees
  await queryInterface.bulkInsert('employees', [
    {
      full_name: 'Jane Smith (Stylist)',
      weekly_hours: 40,
      role: 'staff',
      createdAt: now,
      updatedAt: now,
    },
    {
      full_name: 'Mike Johnson (Manager)',
      weekly_hours: 35,
      role: 'manager',
      createdAt: now,
      updatedAt: now,
    }
  ], {});

  // 3. Insert Services
  await queryInterface.bulkInsert('services', [
    {
      gender_target: 'female',
      washing: true,
      cutting: true,
      coloring: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      gender_target: 'male',
      washing: true,
      cutting: true,
      coloring: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      gender_target: 'female',
      washing: true,
      cutting: true,
      coloring: true,
      createdAt: now,
      updatedAt: now,
    }
  ], {});

  // 4. Insert Appointments
  // We must assume the IDs from above. Since bulkInsert starts IDs at 1, 
  // we assume User IDs 2 and 3, Service IDs 1 and 2, and Employee ID 1.
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5); // 5 days from now

  await queryInterface.bulkInsert('appointments', [
    {
      user_id: 2, // Corresponds to client1@email.com
      service_id: 1, // Corresponds to female, wash, cut
      appointment_date: futureDate,
      notes: 'Needs a layered cut.',
      createdAt: now,
      updatedAt: now,
    },
    {
      user_id: 3, // Corresponds to client2@email.com
      service_id: 2, // Corresponds to male, wash, cut
      appointment_date: futureDate,
      notes: 'Buzz cut.',
      createdAt: now,
      updatedAt: now,
    }
  ], {});

}
export async function down(queryInterface, Sequelize) {
  // Delete all records from tables in reverse order
  await queryInterface.bulkDelete('appointments', null, {});
  await queryInterface.bulkDelete('services', null, {});
  await queryInterface.bulkDelete('employees', null, {});
  await queryInterface.bulkDelete('users', null, {});
}
