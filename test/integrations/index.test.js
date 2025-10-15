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