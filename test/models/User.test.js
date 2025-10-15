import { expect } from 'chai';
import db from '../../src/models/index.js'; 
const { sequelize, User, Employee, Service, Appointment } = db;
import { compare } from 'bcrypt';

describe('User Model', () => {
  before(async () => {
    await db.sequelize.sync({ force: true });
  });

  it('should hash password before saving', async () => {
    const user = await db.User.create({
      username_email: 'test@example.com',
      name: 'Test User',
      password: 'plaintextpassword',
    });
    expect(await compare('plaintextpassword', user.password)).to.be.true;
  });

  it('should have default role "user"', async () => {
    const user = await db.User.create({
      username_email: 'role@example.com',
      name: 'Role User',
      password: 'password',
    });
    expect(user.role).to.equal('user');
  });
});