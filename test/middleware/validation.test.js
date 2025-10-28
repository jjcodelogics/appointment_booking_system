/**
 * Input Validation Middleware Unit Tests
 *
 * Tests validation middleware that checks request data:
 * - Tests 400 Bad Request for missing required fields
 * - Tests 400 Bad Request for malformed data
 * - Tests successful validation with valid data
 */

import { expect } from 'chai';
import validate from '../../src/middleware/validate.js';
import { userSchemas } from '../../src/middleware/user.schemas.js';
import { appointmentsSchemas } from '../../src/middleware/appointments.schemas.js';

describe('Input Validation Middleware Unit Tests', () => {
  describe('User Registration Validation', () => {
    it('should pass validation with valid registration data', () => {
      const req = {
        body: {
          username_email: 'test@example.com',
          name: 'Test User',
          password: 'SecurePass123!',
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(userSchemas.register);
      middleware(req, res, next);

      // Should call next() for valid data
      expect(nextCalled).to.be.true;
      expect(res.statusCode).to.be.undefined;
    });

    it('should return 400 when email is missing', () => {
      const req = {
        body: {
          // Missing username_email
          name: 'Test User',
          password: 'SecurePass123!',
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(userSchemas.register);
      middleware(req, res, next);

      // Should return 400 error
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'Validation failed');
      expect(res.body.errors).to.be.an('array');
      expect(res.body.errors.length).to.be.greaterThan(0);
    });

    it('should return 400 when email format is invalid', () => {
      const req = {
        body: {
          username_email: 'not-an-email',
          name: 'Test User',
          password: 'SecurePass123!',
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(userSchemas.register);
      middleware(req, res, next);

      // Should return 400 error
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'Validation failed');
      expect(res.body.errors).to.be.an('array');

      // Check that error message mentions email
      const emailError = res.body.errors.find(e => e.path.includes('username_email'));
      expect(emailError).to.exist;
    });

    it('should return 400 when password is too short', () => {
      const req = {
        body: {
          username_email: 'test@example.com',
          name: 'Test User',
          password: '12345', // Less than 6 characters
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(userSchemas.register);
      middleware(req, res, next);

      // Should return 400 error
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'Validation failed');

      const passwordError = res.body.errors.find(e => e.path.includes('password'));
      expect(passwordError).to.exist;
    });

    it('should return 400 when name is empty', () => {
      const req = {
        body: {
          username_email: 'test@example.com',
          name: '', // Empty name
          password: 'SecurePass123!',
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(userSchemas.register);
      middleware(req, res, next);

      // Should return 400 error
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(400);
    });
  });

  describe('User Login Validation', () => {
    it('should pass validation with valid login data', () => {
      const req = {
        body: {
          username_email: 'test@example.com',
          password: 'password123',
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(userSchemas.login);
      middleware(req, res, next);

      // Should call next() for valid data
      expect(nextCalled).to.be.true;
      expect(res.statusCode).to.be.undefined;
    });

    it('should return 400 when password is missing', () => {
      const req = {
        body: {
          username_email: 'test@example.com',
          // Missing password
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(userSchemas.login);
      middleware(req, res, next);

      // Should return 400 error
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'Validation failed');
    });
  });

  describe('Appointment Booking Validation', () => {
    it('should pass validation with valid appointment data', () => {
      const req = {
        body: {
          appointment_date: '2025-11-10T10:00:00',
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          notes: 'Test appointment',
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(appointmentsSchemas.create);
      middleware(req, res, next);

      // Should call next() for valid data
      expect(nextCalled).to.be.true;
      expect(res.statusCode).to.be.undefined;
    });

    it('should return 400 when appointment_date is missing', () => {
      const req = {
        body: {
          // Missing appointment_date
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(appointmentsSchemas.create);
      middleware(req, res, next);

      // Should return 400 error
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'Validation failed');
    });

    it('should return 400 when gender is invalid', () => {
      const req = {
        body: {
          appointment_date: '2025-11-10T10:00:00',
          gender: 'invalid', // Invalid gender
          washing: false,
          coloring: false,
          cut: true,
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(appointmentsSchemas.create);
      middleware(req, res, next);

      // Should return 400 error
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 when boolean fields have wrong type', () => {
      const req = {
        body: {
          appointment_date: '2025-11-10T10:00:00',
          gender: 'male',
          washing: 'yes', // Should be boolean
          coloring: false,
          cut: true,
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(appointmentsSchemas.create);
      middleware(req, res, next);

      // Should return 400 error
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 when appointment_date is invalid format', () => {
      const req = {
        body: {
          appointment_date: 'not-a-date',
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(appointmentsSchemas.create);
      middleware(req, res, next);

      // Should return 400 error
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'Validation failed');
    });

    it('should allow optional notes field', () => {
      const req = {
        body: {
          appointment_date: '2025-11-10T10:00:00',
          gender: 'male',
          washing: false,
          coloring: false,
          cut: true,
          // notes is optional, not included
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(appointmentsSchemas.create);
      middleware(req, res, next);

      // Should call next() since notes is optional
      expect(nextCalled).to.be.true;
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error information', () => {
      const req = {
        body: {
          username_email: 'invalid-email',
          name: '',
          password: '123',
        },
        query: {},
        params: {},
      };

      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Execute validation middleware
      const middleware = validate(userSchemas.register);
      middleware(req, res, next);

      // Should return detailed errors
      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.be.an('array');
      expect(res.body.errors.length).to.be.greaterThan(0);

      // Each error should have path and message
      res.body.errors.forEach(error => {
        expect(error).to.have.property('path');
        expect(error).to.have.property('message');
      });
    });
  });
});
