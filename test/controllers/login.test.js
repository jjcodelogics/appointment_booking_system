import { expect as _expect, use, request } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../server.js';
import { sequelize, User } from '../../src/models';
const expect = _expect;

use(chaiHttp);

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