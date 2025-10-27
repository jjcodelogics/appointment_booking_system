/**
 * User Routes & Authentication Integration Tests
 * 
 * Tests user login, registration, and protected profile access
 * using the actual Express routes with a test database.
 */

import { expect } from 'chai';
import { initializeModels } from '../../src/models/index.js';
import db from '../../src/models/index.js';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import loginRoutes from '../../src/controllers/loginQueries.js';

// Import chai-http for making HTTP requests
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);

describe('User Routes & Authentication Integration Tests', () => {
  let app;
  let agent; // Use agent to persist cookies/session

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
          secure: false, // false for testing
          maxAge: 24 * 60 * 60 * 1000,
        },
      })
    );

    // Import and use the passport instance from the middleware
    const passportMiddleware = await import('../../src/middleware/passport.js');
    const passportInstance = passportMiddleware.default;
    app.use(passportInstance.initialize());
    app.use(passportInstance.session());

    // Mount the login routes
    app.use('/auth', loginRoutes);

    // Create a chai-http agent that persists cookies
    agent = chai.request.agent(app);
  });

  after(async () => {
    // Close the agent
    agent.close();
    // Don't close database - let mocha handle cleanup
  });

  describe('User Registration', () => {
    it('should successfully create a new user account', async () => {
      const res = await agent
        .post('/auth/register')
        .send({
          username_email: 'newuser@example.com',
          name: 'New User',
          password: 'SecurePass123!',
        });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('username_email', 'newuser@example.com');
      expect(res.body).to.have.property('name', 'New User');
      // Note: The current implementation returns the hashed password
      // In production, this should be sanitized before returning

      // Verify user was created in database
      const user = await db.User.findOne({ where: { username_email: 'newuser@example.com' } });
      expect(user).to.exist;
      expect(user.name).to.equal('New User');
    });

    it('should fail registration with duplicate email', async () => {
      // First registration
      await agent
        .post('/auth/register')
        .send({
          username_email: 'duplicate@example.com',
          name: 'First User',
          password: 'Pass123!',
        });

      // Attempt duplicate registration
      const res = await agent
        .post('/auth/register')
        .send({
          username_email: 'duplicate@example.com',
          name: 'Second User',
          password: 'Pass456!',
        });

      expect(res).to.have.status(409);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.include('already exists');
    });

    it('should fail registration with invalid password format (too short)', async () => {
      const res = await agent
        .post('/auth/register')
        .send({
          username_email: 'shortpass@example.com',
          name: 'Short Pass User',
          password: '12345', // Less than 6 characters
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Validation failed');
      expect(res.body.errors).to.be.an('array');
    });

    it('should fail registration with invalid email format', async () => {
      const res = await agent
        .post('/auth/register')
        .send({
          username_email: 'not-an-email',
          name: 'Invalid Email User',
          password: 'ValidPass123!',
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Validation failed');
    });

    it('should fail registration with missing required fields', async () => {
      const res = await agent
        .post('/auth/register')
        .send({
          username_email: 'missing@example.com',
          // Missing name and password
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Validation failed');
    });
  });

  describe('User Login', () => {
    before(async () => {
      // Create a test user for login tests
      await db.User.create({
        username_email: 'logintest@example.com',
        name: 'Login Test User',
        password: 'LoginPass123!',
      });
    });

    it('should successfully login with valid credentials', async () => {
      const res = await agent
        .post('/auth/login')
        .send({
          username_email: 'logintest@example.com',
          password: 'LoginPass123!',
        });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('msg', 'Logged in successfully');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('username_email', 'logintest@example.com');
      expect(res.body.user).to.have.property('name', 'Login Test User');
    });

    it('should fail login with incorrect password', async () => {
      const res = await agent
        .post('/auth/login')
        .send({
          username_email: 'logintest@example.com',
          password: 'WrongPassword123!',
        });

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('msg');
      expect(res.body.msg).to.include('Invalid credentials');
    });

    it('should fail login with non-existent user', async () => {
      const res = await agent
        .post('/auth/login')
        .send({
          username_email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        });

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('msg');
    });

    it('should fail login with invalid email format', async () => {
      const res = await agent
        .post('/auth/login')
        .send({
          username_email: 'not-an-email',
          password: 'SomePassword123!',
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Validation failed');
    });

    it('should fail login with missing credentials', async () => {
      const res = await agent
        .post('/auth/login')
        .send({
          username_email: 'test@example.com',
          // Missing password
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Validation failed');
    });
  });

  describe('User Profile Access (Protected Route)', () => {
    let authenticatedAgent;

    before(async () => {
      // Create a fresh agent and login
      authenticatedAgent = chai.request.agent(app);

      // Create a user for authentication tests
      await db.User.create({
        username_email: 'profiletest@example.com',
        name: 'Profile Test User',
        password: 'ProfilePass123!',
      });

      // Login to establish session
      await authenticatedAgent
        .post('/auth/login')
        .send({
          username_email: 'profiletest@example.com',
          password: 'ProfilePass123!',
        });
    });

    after(() => {
      authenticatedAgent.close();
    });

    it('should access user profile with valid session', async () => {
      const res = await authenticatedAgent.get('/auth/user');

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('username_email', 'profiletest@example.com');
      expect(res.body.user).to.have.property('name', 'Profile Test User');
    });

    it('should deny access to profile without valid session', async () => {
      // Create a new agent without logging in
      const unauthenticatedAgent = chai.request.agent(app);
      const res = await unauthenticatedAgent.get('/auth/user');

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('msg');
      expect(res.body.msg).to.include('Not authenticated');

      unauthenticatedAgent.close();
    });

    it('should successfully logout and then deny profile access', async () => {
      // Logout
      const logoutRes = await authenticatedAgent.post('/auth/logout');
      expect(logoutRes).to.have.status(200);
      expect(logoutRes.body).to.have.property('msg', 'Logged out successfully.');

      // Try to access profile after logout
      const profileRes = await authenticatedAgent.get('/auth/user');
      expect(profileRes).to.have.status(401);
    });
  });
});
