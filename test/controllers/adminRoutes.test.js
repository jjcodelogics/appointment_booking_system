import { expect } from 'chai';
import { initializeModels } from '../../src/models/index.js';
import db from '../../src/models/index.js';

describe('Admin Routes Integration', () => {
  before(async () => {
    await initializeModels();
    await db.sequelize.sync({ force: true });
  });

  describe('Admin Authorization', () => {
    it('should have admin middleware setup', async () => {
      // This test validates that the auth middleware exists
      const authModule = await import('../../src/middleware/auth.js');
      const { isAuthenticated, canAccess } = authModule;
      expect(isAuthenticated).to.be.a('function');
      expect(canAccess).to.be.a('function');
    });

    it('should create admin user with role field', async () => {
      const adminUser = await db.User.create({
        username_email: 'admin@example.com',
        name: 'Admin User',
        password: 'AdminPass123!',
        role: 'admin',
      });
      expect(adminUser.role).to.equal('admin');
    });

    it('should create regular user with default role', async () => {
      const regularUser = await db.User.create({
        username_email: 'user@example.com',
        name: 'Regular User',
        password: 'UserPass123!',
      });
      expect(regularUser.role).to.equal('user');
    });
  });

  describe('Appointment Model with Admin Fields', () => {
    it('should create appointment with admin fields', async () => {
      const user = await db.User.create({
        username_email: 'test@example.com',
        name: 'Test User',
        password: 'TestPass123!',
        role: 'admin',
      });

      const service = await db.Service.create({
        service_name: 'Test Service',
        gender_target: 'male',
        cutting: true,
        washing: false,
        coloring: false,
      });

      const appointment = await db.Appointment.create({
        user_id: user.user_id,
        service_id: service.service_id,
        appointment_date: new Date('2025-10-25T10:00:00'),
        notes: 'Test notes',
        status: 'confirmed',
        customer_name: 'John Doe',
        customer_phone: '1234567890',
        staff_assigned: 'Jane Smith',
      });

      expect(appointment.status).to.equal('confirmed');
      expect(appointment.customer_name).to.equal('John Doe');
      expect(appointment.customer_phone).to.equal('1234567890');
      expect(appointment.staff_assigned).to.equal('Jane Smith');
    });

    it('should have default status "confirmed"', async () => {
      const user = await db.User.findOne({ where: { username_email: 'test@example.com' } });
      const service = await db.Service.findOne({ 
        where: { 
          gender_target: 'male',
          cutting: true,
          washing: false,
          coloring: false
        } 
      });

      const appointment = await db.Appointment.create({
        user_id: user.user_id,
        service_id: service.service_id,
        appointment_date: new Date('2025-10-26T11:00:00'),
        notes: 'Another test',
      });

      expect(appointment.status).to.equal('confirmed');
    });
  });
});
