/**
 * Authorization Middleware Unit Tests
 *
 * Tests authorization middleware that enforces role-based access:
 * - canAccess: Verifies user has required role(s)
 * - Tests user role prevented from admin resources
 * - Tests admin role allowed to access admin resources
 */

import { expect } from 'chai';
import { canAccess } from '../../src/middleware/auth.js';

describe('Authorization Middleware Unit Tests', () => {
  describe('canAccess Middleware', () => {
    it('should allow access when user has required role (admin)', () => {
      // Mock request with admin user
      const req = {
        user: { user_id: 1, username_email: 'admin@example.com', role: 'admin' },
      };

      // Mock response
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

      // Create middleware instance for admin role
      const middleware = canAccess(['admin']);
      middleware(req, res, next);

      // Verify next() was called
      expect(nextCalled).to.be.true;
      expect(res.statusCode).to.be.undefined;
    });

    it('should deny access when user role is not in allowed roles', () => {
      // Mock request with regular user trying to access admin resource
      const req = {
        user: { user_id: 2, username_email: 'user@example.com', role: 'user' },
      };

      // Mock response
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

      // Create middleware instance requiring admin role
      const middleware = canAccess(['admin']);
      middleware(req, res, next);

      // Verify access was denied
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(403);
      expect(res.body).to.have.property('msg');
      expect(res.body.msg).to.include('Forbidden');
    });

    it('should allow access when user role is in multiple allowed roles', () => {
      // Mock request with user role
      const req = {
        user: { user_id: 3, username_email: 'user@example.com', role: 'user' },
      };

      // Mock response
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

      // Create middleware instance allowing both user and admin roles
      const middleware = canAccess(['user', 'admin']);
      middleware(req, res, next);

      // Verify next() was called
      expect(nextCalled).to.be.true;
      expect(res.statusCode).to.be.undefined;
    });

    it('should deny access when req.user is not present', () => {
      // Mock request without user object
      const req = {};

      // Mock response
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

      // Create middleware instance
      const middleware = canAccess(['admin']);
      middleware(req, res, next);

      // Verify access was denied
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(403);
      expect(res.body).to.have.property('msg');
    });

    it('should deny access when user.role is not present', () => {
      // Mock request with user but no role
      const req = {
        user: { user_id: 4, username_email: 'norole@example.com' },
      };

      // Mock response
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

      // Create middleware instance
      const middleware = canAccess(['admin']);
      middleware(req, res, next);

      // Verify access was denied
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(403);
    });
  });

  describe('Multiple Role Scenarios', () => {
    it('should allow admin to access user and admin routes', () => {
      const req = {
        user: { user_id: 1, username_email: 'admin@example.com', role: 'admin' },
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

      // Test access to route allowing both user and admin
      const middleware = canAccess(['user', 'admin']);
      middleware(req, res, next);

      expect(nextCalled).to.be.true;
    });

    it('should allow manager role when specified in allowed roles', () => {
      const req = {
        user: { user_id: 5, username_email: 'manager@example.com', role: 'manager' },
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

      // Create middleware allowing manager role
      const middleware = canAccess(['admin', 'manager']);
      middleware(req, res, next);

      expect(nextCalled).to.be.true;
    });

    it('should deny manager access to user-only route', () => {
      const req = {
        user: { user_id: 5, username_email: 'manager@example.com', role: 'manager' },
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

      // Create middleware allowing only user role
      const middleware = canAccess(['user']);
      middleware(req, res, next);

      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(403);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty allowed roles array', () => {
      const req = {
        user: { user_id: 1, username_email: 'test@example.com', role: 'user' },
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

      // Create middleware with empty allowed roles
      const middleware = canAccess([]);
      middleware(req, res, next);

      // Should deny access since no roles are allowed
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(403);
    });

    it('should be case-sensitive for role matching', () => {
      const req = {
        user: { user_id: 1, username_email: 'test@example.com', role: 'Admin' },
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

      // Create middleware requiring lowercase 'admin'
      const middleware = canAccess(['admin']);
      middleware(req, res, next);

      // Should deny access due to case mismatch
      expect(nextCalled).to.be.false;
      expect(res.statusCode).to.equal(403);
    });
  });
});
