/**
 * Appointment Routes Integration Tests
 * 
 * Tests appointment booking creation, conflict handling, and retrieval
 * using the actual Express routes with a test database.
 */

import { expect } from 'chai';
import { initializeModels } from '../../src/models/index.js';
import db from '../../src/models/index.js';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import loginRoutes from '../../src/controllers/loginQueries.js';
import appointmentRoutes from '../../src/controllers/appointmentRoutes.js';

// Import chai-http for making HTTP requests
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);

describe('Appointment Routes Integration Tests', () => {
  let app;
  let authenticatedAgent;
  let testUser;
  let testService;

  before(async () => {
    // Initialize database models
    await initializeModels();
    await db.sequelize.sync({ force: true });

    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Initialize session middleware
    app.use(
      session({
        name: 'testSessionId',
        secret: 'test-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
        },
      })
    );

    // Import and use the passport instance from the middleware
    const passportMiddleware = await import('../../src/middleware/passport.js');
    const passportInstance = passportMiddleware.default;
    app.use(passportInstance.initialize());
    app.use(passportInstance.session());

    // Mount the routes
    app.use('/auth', loginRoutes);
    app.use('/api/appointments', appointmentRoutes);

    // Create test user and service
    testUser = await db.User.create({
      username_email: 'appointmenttest@example.com',
      name: 'Appointment Test User',
      password: 'AppointmentPass123!',
    });

    testService = await db.Service.create({
      gender_target: 'male',
      cutting: true,
      washing: false,
      coloring: false,
    });

    // Create authenticated agent and login
    authenticatedAgent = chai.request.agent(app);
    await authenticatedAgent
      .post('/auth/login')
      .send({
        username_email: 'appointmenttest@example.com',
        password: 'AppointmentPass123!',
      });
  });

  after(async () => {
    authenticatedAgent.close();
    // Don't close database - let mocha handle cleanup
  });

  describe('Appointment Booking Creation', () => {
    it('should successfully create a new appointment with valid data', async () => {
      // Choose a date on a Tuesday at 10:00 AM (within business hours)
      const appointmentDate = new Date('2025-11-04T10:00:00');

      const res = await authenticatedAgent
        .post('/api/appointments/book')
        .send({
          appointment_date: appointmentDate.toISOString(),
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          notes: 'Test appointment',
        });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('msg', 'Appointment booked successfully!');
      expect(res.body).to.have.property('appointment');
      expect(res.body.appointment).to.have.property('appointment_id');

      // Verify appointment was created in database
      const appointment = await db.Appointment.findOne({
        where: { appointment_id: res.body.appointment.appointment_id }
      });
      expect(appointment).to.exist;
      expect(appointment.user_id).to.equal(testUser.user_id);
    });

    it('should fail to create appointment outside business hours (Sunday)', async () => {
      // Sunday at 10:00 AM (business closed)
      const appointmentDate = new Date('2025-11-02T10:00:00');

      const res = await authenticatedAgent
        .post('/api/appointments/book')
        .send({
          appointment_date: appointmentDate.toISOString(),
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          notes: 'Test appointment',
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('msg');
      expect(res.body.msg).to.include('outside of business hours');
    });

    it('should fail to create appointment outside business hours (Monday)', async () => {
      // Monday at 10:00 AM (business closed)
      const appointmentDate = new Date('2025-11-03T10:00:00');

      const res = await authenticatedAgent
        .post('/api/appointments/book')
        .send({
          appointment_date: appointmentDate.toISOString(),
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          notes: 'Test appointment',
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('msg');
      expect(res.body.msg).to.include('outside of business hours');
    });

    it('should fail to create appointment with no services selected', async () => {
      const appointmentDate = new Date('2025-11-05T10:00:00');

      const res = await authenticatedAgent
        .post('/api/appointments/book')
        .send({
          appointment_date: appointmentDate.toISOString(),
          gender: 'male',
          washing: false,
          coloring: false,
          cut: false, // No services selected
          notes: 'Test appointment',
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('msg');
      expect(res.body.msg).to.include('must select at least one service');
    });

    it('should require authentication to create appointment', async () => {
      const unauthenticatedAgent = chai.request.agent(app);
      const appointmentDate = new Date('2025-11-06T10:00:00');

      const res = await unauthenticatedAgent
        .post('/api/appointments/book')
        .send({
          appointment_date: appointmentDate.toISOString(),
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          notes: 'Test appointment',
        });

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('msg');
      expect(res.body.msg).to.include('Unauthorized');

      unauthenticatedAgent.close();
    });
  });

  describe('Appointment Conflict Handling', () => {
    beforeEach(async () => {
      // Clean up appointments before each conflict test
      await db.Appointment.destroy({ where: {} });
    });

    it('should prevent booking when slot is already taken', async () => {
      // First, create an appointment at a specific time
      const appointmentDate = new Date('2025-11-07T14:00:00');
      
      const firstBooking = await authenticatedAgent
        .post('/api/appointments/book')
        .send({
          appointment_date: appointmentDate.toISOString(),
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          notes: 'First appointment',
        });

      expect(firstBooking).to.have.status(201);

      // Now try to book the same time slot
      const conflictingBooking = await authenticatedAgent
        .post('/api/appointments/book')
        .send({
          appointment_date: appointmentDate.toISOString(),
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          notes: 'Conflicting appointment',
        });

      expect(conflictingBooking).to.have.status(409);
      expect(conflictingBooking.body).to.have.property('msg');
      expect(conflictingBooking.body.msg).to.include('already booked');
    });

    it('should allow booking different time slots', async () => {
      // Book first appointment
      const firstDate = new Date('2025-11-08T10:00:00');
      const firstBooking = await authenticatedAgent
        .post('/api/appointments/book')
        .send({
          appointment_date: firstDate.toISOString(),
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          notes: 'First appointment',
        });

      expect(firstBooking).to.have.status(201);

      // Book second appointment at different time
      const secondDate = new Date('2025-11-08T11:00:00');
      const secondBooking = await authenticatedAgent
        .post('/api/appointments/book')
        .send({
          appointment_date: secondDate.toISOString(),
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          notes: 'Second appointment',
        });

      expect(secondBooking).to.have.status(201);

      // Verify both appointments exist
      const appointments = await db.Appointment.findAll({
        where: { user_id: testUser.user_id }
      });
      expect(appointments).to.have.lengthOf(2);
    });
  });

  describe('Appointment Retrieval', () => {
    before(async () => {
      // Clean up and create test appointments
      await db.Appointment.destroy({ where: {} });

      // Create multiple appointments for the test user
      await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-10T10:00:00'),
        notes: 'First appointment',
      });

      await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-11T14:00:00'),
        notes: 'Second appointment',
      });

      // Create appointment for a different user
      const otherUser = await db.User.create({
        username_email: 'otheruser@example.com',
        name: 'Other User',
        password: 'OtherPass123!',
      });

      await db.Appointment.create({
        user_id: otherUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-12T15:00:00'),
        notes: 'Other user appointment',
      });
    });

    it('should retrieve all appointments for the authenticated user', async () => {
      const res = await authenticatedAgent.get('/api/appointments/my-appointments');

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(2); // Only the authenticated user's appointments

      // Verify appointments belong to the authenticated user
      res.body.forEach(appointment => {
        expect(appointment.user_id).to.equal(testUser.user_id);
      });

      // Verify they are ordered by date (ascending)
      const dates = res.body.map(appt => new Date(appt.appointment_date).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).to.be.at.least(dates[i - 1]);
      }
    });

    it('should require authentication to retrieve appointments', async () => {
      const unauthenticatedAgent = chai.request.agent(app);
      const res = await unauthenticatedAgent.get('/api/appointments/my-appointments');

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('msg');
      expect(res.body.msg).to.include('Unauthorized');

      unauthenticatedAgent.close();
    });

    it('should return empty array when user has no appointments', async () => {
      // Create and login as a new user with no appointments
      const newUser = await db.User.create({
        username_email: 'noappts@example.com',
        name: 'No Appointments User',
        password: 'NoAppts123!',
      });

      const newAgent = chai.request.agent(app);
      await newAgent
        .post('/auth/login')
        .send({
          username_email: 'noappts@example.com',
          password: 'NoAppts123!',
        });

      const res = await newAgent.get('/api/appointments/my-appointments');

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(0);

      newAgent.close();
    });
  });

  describe('Booked Slots Retrieval', () => {
    before(async () => {
      // Clean up and create test appointments for a specific date
      await db.Appointment.destroy({ where: {} });

      // Create appointments on 2025-11-15
      await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-15T10:00:00'),
        notes: 'Morning slot',
      });

      await db.Appointment.create({
        user_id: testUser.user_id,
        service_id: testService.service_id,
        appointment_date: new Date('2025-11-15T14:00:00'),
        notes: 'Afternoon slot',
      });
    });

    it('should retrieve all booked slots for a specific date', async () => {
      const res = await authenticatedAgent
        .get('/api/appointments/slots')
        .query({ date: '2025-11-15' });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(2);
      
      // Verify the format is HH:MM
      res.body.forEach(slot => {
        expect(slot).to.match(/^\d{2}:\d{2}$/);
      });
    });

    it('should return empty array for date with no bookings', async () => {
      const res = await authenticatedAgent
        .get('/api/appointments/slots')
        .query({ date: '2025-11-20' });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(0);
    });

    it('should require date query parameter', async () => {
      const res = await authenticatedAgent.get('/api/appointments/slots');

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('msg');
      expect(res.body.msg).to.include('date query parameter is required');
    });
  });
});
