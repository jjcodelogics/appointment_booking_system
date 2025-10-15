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


describe('Admin Appointments Controller', () => {
  before(async () => {
    await sequelize.sync({ force: true });
    await User.create({
      username_email: 'admin@example.com',
      name: 'Admin',
      password: 'adminpass',
      role: 'admin'
    });
  });

  it('should require authentication for GET /appointments', (done) => {
    // 'request' is now correctly imported and is a function
    request(server) 
      .get('/appointments')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});