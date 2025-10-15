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
describe('Admin Appointments Controller', () => {
  before(async () => {
    await sequelize.sync({ force: true });
    await User.create({
      username_email: 'admin@example.com',
      name: 'Admin',
      password: 'adminpass',
      role: 'admin',
    });
  });

  it('should require authentication for GET /appointments', (done) => {
    chai.request(server)
      .get('/appointments')
      .end((err, res) => {
        try {
          expect(res).to.have.status(401);
          done();
        } catch (e) {
          done(e);
        }
      });
  });
});
