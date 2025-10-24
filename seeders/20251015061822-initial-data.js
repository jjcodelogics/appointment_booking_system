'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  const now = new Date();

  // 1. Insert Users FIRST
  // NOTE: In a real app, 'password' MUST be hashed. Your User model hook handles this.
  await queryInterface.bulkInsert('users', [
    {
      user_id: 1,
      username_email: 'client1@email.com',
      name: 'Client One',
      password: 'hashedpassword1', // Will be hashed by the model
      createdAt: now,
      updatedAt: now,
    },
    {
      user_id: 2,
      username_email: 'client2@email.com',
      name: 'Client Two',
      password: 'hashedpassword2', // Will be hashed by the model
      createdAt: now,
      updatedAt: now,
    },
    {
      user_id: 3,
      username_email: 'admin@salon.com',
      name: 'Admin User',
      password: 'secure_admin_password', // Will be hashed by the model
      role: 'admin',
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
      service_id: 1,
      gender_target: 'female',
      washing: true,
      cutting: true,
      coloring: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      service_id: 2,
      gender_target: 'male',
      washing: true,
      cutting: true,
      coloring: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      service_id: 3,
      gender_target: 'female',
      washing: true,
      cutting: true,
      coloring: true,
      createdAt: now,
      updatedAt: now,
    }
  ], {});

  // 4. Insert Appointments
  // Use user_id: 1 and user_id: 2 for the above users
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5); // 5 days from now

  await queryInterface.bulkInsert('appointments', [
    {
      user_id: 1, // Corresponds to client1@email.com
      service_id: 1, // Corresponds to female, wash, cut
      appointment_date: futureDate,
      notes: 'Needs a layered cut.',
      createdAt: now,
      updatedAt: now,
    },
    {
      user_id: 2, // Corresponds to client2@email.com
      service_id: 2, // Corresponds to male, wash, cut
      appointment_date: futureDate,
      notes: 'Buzz cut.',
      createdAt: now,
      updatedAt: now,
    }
  ], {});

}
export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('appointments', null, {}); // Delete appointments first
  await queryInterface.bulkDelete('services', null, {});     // Then delete services
  await queryInterface.bulkDelete('employees', null, {});
  await queryInterface.bulkDelete('users', null, {});
}
