import chai, { expect as _expect, use } from 'chai'; // <-- FIX: Import chai object
import chaiHttp from 'chai-http';
import * as serverModule from '../../server.js';
const server = serverModule.default; 
import db from '../../src/models/index.js';
const { sequelize, User } = db;

use(chaiHttp); 

// FIX: Access the request function from the imported 'chai' object.
const request = chai.request; 

const expect = _expect; // Keep the assertion alias


describe('Integration: Health Check', () => {
  it('should respond to GET /', (done) => {
    // 'request' is now correctly imported and is a function
    request(server)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(404); // No root route defined, should 404
        done();
      });
  });
});