import { expect as _expect, use, request } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../server.js';
import db from '../../src/models/index.js';
const expect = _expect;

use(chaiHttp);

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
    request(server)
      .get('/myappointments')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});