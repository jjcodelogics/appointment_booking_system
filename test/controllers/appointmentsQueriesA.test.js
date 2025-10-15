import { expect as _expect, use, request } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../server.js';
import { sequelize, User } from '../../src/models/index';
const expect = _expect;

use(chaiHttp);

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
    request(server)
      .get('/appointments')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});