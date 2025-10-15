'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // The 'up' function inserts the data.
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. Insert Users
    // NOTE: In a real app, 'password' MUST be hashed (e.g., using bcrypt).
    await queryInterface.bulkInsert('users', [
      {
        username_email: 'admin@salon.com',
        name: 'Admin User',
        password: 'secure_admin_password', 
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      },
      {
        username_email: 'client1@email.com',
        name: 'Client One',
        password: 'client1pass',
        role: 'user',
        createdAt: now,
        updatedAt: now,
      },
      {
        username_email: 'client2@email.com',
        name: 'Client Two',
        password: 'client2pass',
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
        male_female: 'female',
        washing: true,
        cutting: true,
        coloring: false,
        price: 45.00,
        createdAt: now,
        updatedAt: now,
      },
      {
        gender_target: 'male',
        washing: true,
        cutting: true,
        coloring: false,
        price: 30.00,
        createdAt: now,
        updatedAt: now,
      },
      {
        gender_target: 'female',
        washing: true,
        cutting: true,
        coloring: true,
        price: 120.00,
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
        appointment_date: futureDate,
        status: 'scheduled',
        notes: 'Needs a layered cut.',
        service_id: 1, // Corresponds to Female Wash/Cut
        employee_id: 1, // Corresponds to Jane Smith
        createdAt: now,
        updatedAt: now,
      },
      {
        user_id: 3, // Corresponds to client2@email.com
        appointment_date: futureDate,
        status: 'scheduled',
        notes: 'Buzz cut.',
        service_id: 2, // Corresponds to Male Wash/Cut
        employee_id: 1, // Corresponds to Jane Smith
        createdAt: now,
        updatedAt: now,
      }
    ], {});

  },

  // The 'down' function deletes the data.
  down: async (queryInterface, Sequelize) => {
    // Delete all records from tables
    await queryInterface.bulkDelete('appointments', null, {});
    await queryInterface.bulkDelete('services', null, {});
    await queryInterface.bulkDelete('employees', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
