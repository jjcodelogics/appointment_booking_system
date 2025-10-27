/**
 * Appointment Model Unit Tests
 * 
 * Tests data validation rules for the Appointment model including:
 * - Required date/time validation
 * - Valid user foreign key constraint
 * - Service foreign key constraint
 */

import { expect } from 'chai';
import { initializeModels } from '../../src/models/index.js';
import db from '../../src/models/index.js';

describe('Appointment Model Unit Tests', () => {
  let testUser;
  let testService;

  before(async () => {
    await initializeModels();
    await db.sequelize.sync({ force: true });

    // Create test user and service for foreign key references
    testUser = await db.User.create({
      username_email: 'appointmentmodel@example.com',
      name: 'Appointment Model Test User',
      password: 'Password123!',
    });

    testService = await db.Service.create({
      gender_target: 'male',
      cutting: true,
      washing: false,
      coloring: false,
    });
  });

  afterEach(async () => {
    // Clean up appointments after each test
    await db.Appointment.destroy({ where: {}, truncate: true });
  });

  describe('Required Fields Validation', () => {
    it('should require user_id field', async () => {
      try {
        await db.Appointment.create({
          // Missing user_id
          service_id: testService.service_id,
          appointment_date: new Date('2025-11-10T10:00:00'),
        });
        expect.fail('Should have thrown a validation error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeValidationError');
        expect(error.errors[0].path).to.equal('user_id');
      }
    });

    it('should require service_id field', async () => {
      try {
        await db.Appointment.create({
          user_id: testUser.user_id,
          // Missing service_id
          appointment_date: new Date('2025-11-10T10:00:00'),
        });
        expect.fail('Should have thrown a validation error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeValidationError');
        expect(error.errors[0].path).to.equal('service_id');
      }
    });

    it('should require appointment_date field', async () => {
      try {
        await db.Appointment.create({
          user_id: testUser.user_id,
          service_id: testService.service_id,
          // Missing appointment_date
        });
        expect.fail('Should have thrown a validation error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeValidationError');
        expect(error.errors[0].path).to.equal('appointment_date');
      }
    });

    it('should successfully create appointment with all required fields', async () => {
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-10T10:00:00'),
      });

      expect(appointment).to.exist;
      expect(appointment.appointment_id).to.exist;
      expect(appointment.user_id).to.equal(testUser.user_id);
      expect(appointment.service_id).to.equal(testService.service_id);
      expect(appointment.appointment_date).to.be.instanceOf(Date);
    });
  });

  describe('Date/Time Validation', () => {
    it('should accept valid date/time', async () => {
      const appointmentDate = new Date('2025-12-15T14:30:00');
      
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: appointmentDate,
      });

      expect(appointment.appointment_date).to.be.instanceOf(Date);
      expect(appointment.appointment_date.getTime()).to.equal(appointmentDate.getTime());
    });

    it('should enforce unique appointment_date constraint', async () => {
      const appointmentDate = new Date('2025-11-11T10:00:00');
      
      // Create first appointment
      await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: appointmentDate,
      });

      // Try to create another appointment at the same time
      try {
        await db.Appointment.create({
          user_id: testUser.user_id,
          service_id: testService.service_id,
          appointment_date: appointmentDate,
        });
        expect.fail('Should have thrown a unique constraint error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeUniqueConstraintError');
      }
    });

    it('should allow different appointment times', async () => {
      const appointment1 = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-12T10:00:00'),
      });

      const appointment2 = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-12T11:00:00'),
      });

      expect(appointment1.appointment_id).to.not.equal(appointment2.appointment_id);
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should validate user_id foreign key exists', async () => {
      try {
        await db.Appointment.create({
          user_id: 99999, // Non-existent user ID
          service_id: testService.service_id,
          appointment_date: new Date('2025-11-13T10:00:00'),
        });
        expect.fail('Should have thrown a foreign key constraint error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeForeignKeyConstraintError');
      }
    });

    it('should validate service_id foreign key exists', async () => {
      try {
        await db.Appointment.create({
          user_id: testUser.user_id,
          service_id: 99999, // Non-existent service ID
          appointment_date: new Date('2025-11-13T10:00:00'),
        });
        expect.fail('Should have thrown a foreign key constraint error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeForeignKeyConstraintError');
      }
    });

    it('should create appointment with valid foreign keys', async () => {
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-13T10:00:00'),
      });

      expect(appointment.user_id).to.equal(testUser.user_id);
      expect(appointment.service_id).to.equal(testService.service_id);
    });
  });

  describe('Default Values', () => {
    it('should set default status to "confirmed"', async () => {
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-14T10:00:00'),
      });

      expect(appointment.status).to.equal('confirmed');
    });

    it('should allow overriding default status', async () => {
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-14T11:00:00'),
        status: 'pending',
      });

      expect(appointment.status).to.equal('pending');
    });
  });

  describe('Optional Fields', () => {
    it('should allow creating appointment without notes', async () => {
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-15T10:00:00'),
      });

      // SQLite returns undefined for null fields
      expect(appointment.notes).to.satisfy((val) => val === null || val === undefined);
    });

    it('should store notes when provided', async () => {
      const notes = 'Please bring a referral letter';
      
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-15T11:00:00'),
        notes: notes,
      });

      expect(appointment.notes).to.equal(notes);
    });

    it('should allow customer_name, customer_phone, and staff_assigned (admin fields)', async () => {
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-15T12:00:00'),
        customer_name: 'John Doe',
        customer_phone: '555-1234',
        staff_assigned: 'Jane Smith',
      });

      expect(appointment.customer_name).to.equal('John Doe');
      expect(appointment.customer_phone).to.equal('555-1234');
      expect(appointment.staff_assigned).to.equal('Jane Smith');
    });
  });

  describe('Associations', () => {
    it('should load associated User', async () => {
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-16T10:00:00'),
      });

      const appointmentWithUser = await db.Appointment.findByPk(
        appointment.appointment_id,
        { include: [{ model: db.User, as: 'User' }] }
      );

      expect(appointmentWithUser.User).to.exist;
      expect(appointmentWithUser.User.user_id).to.equal(testUser.user_id);
      expect(appointmentWithUser.User.username_email).to.equal('appointmentmodel@example.com');
    });

    it('should load associated Service', async () => {
      const appointment = await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-16T11:00:00'),
      });

      const appointmentWithService = await db.Appointment.findByPk(
        appointment.appointment_id,
        { include: [{ model: db.Service, as: 'Service' }] }
      );

      expect(appointmentWithService.Service).to.exist;
      expect(appointmentWithService.Service.service_id).to.equal(testService.service_id);
      expect(appointmentWithService.Service.cutting).to.be.true;
    });
  });
});
