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


describe('Login Controller', () => {
  before(async () => {
    await sequelize.sync({ force: true });
    await User.create({
      username_email: 'login@example.com',
      name: 'Login User',
      password: 'password',
    });
  });

  it('should register a new user', (done) => {
    // 2. 'request' is now correctly imported and is a function
    request(server) 
      .post('/auth/register')
      .send({
        username_email: 'newuser@example.com',
        name: 'New User',
        password: 'newpassword'
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.property('username');
        done();
      });
  });

  it('should not login with wrong password', (done) => {
    request(server)
      .post('/auth/login')
      .send({
        username_email: 'login@example.com',
        password: 'wrongpassword'
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});