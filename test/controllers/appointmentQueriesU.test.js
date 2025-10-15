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


describe('User Appointments Controller', () => {
  before(async () => {
    await db.sequelize.sync({ force: true });
    await db.User.create({
      username_email: 'userappt@example.com',
      name: 'User Appt',
      password: 'userpass',
    });
  });

  it('should require authentication for GET /myappointments', (done) => {
    // 'request' is now correctly imported and is a function
    request(server) 
      .get('/myappointments')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});