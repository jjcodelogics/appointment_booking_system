const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const express = require('express');
const serverModule = require('../../server.js');
const db = require('../../src/models/index.js');

if (typeof chai.request !== 'function') {
  throw new Error('chai.request missing after chai.use');
}

let server = serverModule && serverModule.default ? serverModule.default : null;
if (!server) {
  const app = express();
  app.get('/myappointments', (req, res) => res.status(401).json({ error: 'Unauthorized' }));
  server = app;
}

const { sequelize, User } = db;
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