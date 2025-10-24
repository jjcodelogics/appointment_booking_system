import { expect } from 'chai';
import { isAuthenticated, canAccess } from '../../src/middleware/auth.js';

describe('Auth Middleware', () => {
  describe('isAuthenticated', () => {
    it('should call next() if user is authenticated', () => {
      const req = {
        isAuthenticated: () => true,
      };
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      isAuthenticated(req, res, next);
      expect(nextCalled).to.be.true;
    });

    it('should return 401 if user is not authenticated', () => {
      const req = {
        isAuthenticated: () => false,
      };
      let statusCode;
      let jsonData;
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => { jsonData = data; },
          };
        },
      };
      const next = () => {};

      isAuthenticated(req, res, next);
      expect(statusCode).to.equal(401);
      expect(jsonData).to.have.property('msg');
    });
  });

  describe('canAccess', () => {
    it('should allow access for users with admin role', () => {
      const req = {
        user: { role: 'admin' },
      };
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      const middleware = canAccess(['admin']);
      middleware(req, res, next);
      expect(nextCalled).to.be.true;
    });

    it('should deny access for users without required role', () => {
      const req = {
        user: { role: 'user' },
      };
      let statusCode;
      let jsonData;
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => { jsonData = data; },
          };
        },
      };
      const next = () => {};

      const middleware = canAccess(['admin']);
      middleware(req, res, next);
      expect(statusCode).to.equal(403);
      expect(jsonData).to.have.property('msg');
    });

    it('should allow access for multiple allowed roles', () => {
      const req = {
        user: { role: 'user' },
      };
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      const middleware = canAccess(['user', 'admin']);
      middleware(req, res, next);
      expect(nextCalled).to.be.true;
    });
  });
});
