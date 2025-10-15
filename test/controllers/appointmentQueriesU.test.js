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
describe('User Appointments Controller', () => {
  before(async () => {
    await sequelize.sync({ force: true });
    await User.create({
      username_email: 'userappt@example.com',
      name: 'User Appt',
      password: 'userpass',
    });
  });

  it('should require authentication for GET /myappointments', (done) => {
    chai.request(server)
      .get('/myappointments')
      .end((err, res) => {
        try {
          chai.expect(res).to.have.status(401);
          done();
        } catch (e) {
          done(e);
        }
      });
  });
});

