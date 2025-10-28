/**
 * User Model Unit Tests
 *
 * Tests data validation rules for the User model including:
 * - Email uniqueness
 * - Required fields
 * - Password hashing
 */

import { expect } from 'chai';
import { initializeModels } from '../../src/models/index.js';
import db from '../../src/models/index.js';
import bcrypt from 'bcrypt';

describe('User Model Unit Tests', () => {
  before(async () => {
    await initializeModels();
    await db.sequelize.sync({ force: true });
  });

  afterEach(async () => {
    // Reset the database to a clean state between tests. Using sync({ force: true })
    // drops and recreates tables which avoids FK constraint issues when truncating.
    await db.sequelize.sync({ force: true });
  });

  describe('Email Uniqueness Validation', () => {
    it('should enforce unique email constraint', async () => {
      // Create first user
      await db.User.create({
        username_email: 'unique@example.com',
        name: 'First User',
        password: 'Password123!',
      });

      // Try to create another user with the same email
      try {
        await db.User.create({
          username_email: 'unique@example.com',
          name: 'Second User',
          password: 'Password456!',
        });
        // If we get here, the test should fail
        expect.fail('Should have thrown a unique constraint error');
      } catch (error) {
        // Verify it's a unique constraint error
        expect(error.name).to.equal('SequelizeUniqueConstraintError');
      }
    });

    it('should allow different users with different emails', async () => {
      const user1 = await db.User.create({
        username_email: 'user1@example.com',
        name: 'User One',
        password: 'Password123!',
      });

      const user2 = await db.User.create({
        username_email: 'user2@example.com',
        name: 'User Two',
        password: 'Password456!',
      });

      expect(user1.user_id).to.not.equal(user2.user_id);
      expect(user1.username_email).to.equal('user1@example.com');
      expect(user2.username_email).to.equal('user2@example.com');
    });
  });

  describe('Required Fields Validation', () => {
    it('should require username_email field', async () => {
      try {
        await db.User.create({
          // Missing username_email
          name: 'Test User',
          password: 'Password123!',
        });
        expect.fail('Should have thrown a validation error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeValidationError');
        expect(error.errors[0].path).to.equal('username_email');
      }
    });

    it('should require name field', async () => {
      try {
        await db.User.create({
          username_email: 'test@example.com',
          // Missing name
          password: 'Password123!',
        });
        expect.fail('Should have thrown a validation error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeValidationError');
        expect(error.errors[0].path).to.equal('name');
      }
    });

    it('should require password field', async () => {
      try {
        await db.User.create({
          username_email: 'test@example.com',
          name: 'Test User',
          // Missing password
        });
        expect.fail('Should have thrown a validation error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeValidationError');
        expect(error.errors[0].path).to.equal('password');
      }
    });

    it('should successfully create user with all required fields', async () => {
      const user = await db.User.create({
        username_email: 'complete@example.com',
        name: 'Complete User',
        password: 'Password123!',
      });

      expect(user).to.exist;
      expect(user.user_id).to.exist;
      expect(user.username_email).to.equal('complete@example.com');
      expect(user.name).to.equal('Complete User');
    });
  });

  describe('Password Hashing', () => {
    it('should automatically hash password on user creation', async () => {
      const plainPassword = 'MySecurePassword123!';

      const user = await db.User.create({
        username_email: 'hashtest@example.com',
        name: 'Hash Test User',
        password: plainPassword,
      });

      // Password should be hashed (not equal to plain password)
      expect(user.password).to.not.equal(plainPassword);

      // Password should be a bcrypt hash (starts with $2b$)
      expect(user.password).to.match(/^\$2[aby]\$\d{2}\$/);

      // Should be able to verify the password
      const isValid = await bcrypt.compare(plainPassword, user.password);
      expect(isValid).to.be.true;
    });

    it('should validate password using validPassword method', async () => {
      const plainPassword = 'TestPassword456!';

      const user = await db.User.create({
        username_email: 'validation@example.com',
        name: 'Validation Test User',
        password: plainPassword,
      });

      // Correct password should validate
      const isValidCorrect = await user.validPassword(plainPassword);
      expect(isValidCorrect).to.be.true;

      // Incorrect password should not validate
      const isValidIncorrect = await user.validPassword('WrongPassword!');
      expect(isValidIncorrect).to.be.false;
    });

    it('should hash password with sufficient strength (salt rounds)', async () => {
      const user = await db.User.create({
        username_email: 'strength@example.com',
        name: 'Strength Test User',
        password: 'SecurePass789!',
      });

      // Extract salt rounds from hash
      // Bcrypt hash format: $2b$10$... where 10 is the salt rounds
      const saltRounds = parseInt(user.password.split('$')[2]);

      // Should use at least 10 rounds (as specified in User model)
      expect(saltRounds).to.be.at.least(10);
    });

    it('should hash different passwords differently', async () => {
      const user1 = await db.User.create({
        username_email: 'user1@example.com',
        name: 'User One',
        password: 'Password123!',
      });

      const user2 = await db.User.create({
        username_email: 'user2@example.com',
        name: 'User Two',
        password: 'Password456!',
      });

      // Different passwords should result in different hashes
      expect(user1.password).to.not.equal(user2.password);
    });

    it('should hash same password differently (due to salt)', async () => {
      const samePassword = 'SamePassword123!';

      const user1 = await db.User.create({
        username_email: 'same1@example.com',
        name: 'Same User One',
        password: samePassword,
      });

      const user2 = await db.User.create({
        username_email: 'same2@example.com',
        name: 'Same User Two',
        password: samePassword,
      });

      // Even with same password, hashes should be different due to different salts
      expect(user1.password).to.not.equal(user2.password);

      // But both should validate with the original password
      expect(await user1.validPassword(samePassword)).to.be.true;
      expect(await user2.validPassword(samePassword)).to.be.true;
    });
  });

  describe('Default Role Assignment', () => {
    it('should assign default role "user" when not specified', async () => {
      const user = await db.User.create({
        username_email: 'defaultrole@example.com',
        name: 'Default Role User',
        password: 'Password123!',
      });

      expect(user.role).to.equal('user');
    });

    it('should allow setting role to "admin"', async () => {
      const user = await db.User.create({
        username_email: 'admin@example.com',
        name: 'Admin User',
        password: 'Password123!',
        role: 'admin',
      });

      expect(user.role).to.equal('admin');
    });

    it('should allow setting role to custom value', async () => {
      const user = await db.User.create({
        username_email: 'custom@example.com',
        name: 'Custom Role User',
        password: 'Password123!',
        role: 'manager',
      });

      expect(user.role).to.equal('manager');
    });
  });
});
