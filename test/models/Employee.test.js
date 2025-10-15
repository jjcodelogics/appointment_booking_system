import { expect } from 'chai';
import db from '../../src/models/index.js'; 
const { sequelize, User, Employee, Service, Appointment } = db;

describe('Employee Model', () => {
  before(async () => {
    await db.sequelize.sync({ force: true });
  });

  it('should create an employee with default role "staff"', async () => {
    const emp = await db.Employee.create({
      full_name: 'Jane Doe',
      weekly_hours: 40,
    });
    expect(emp.role).to.equal('staff');
  });
});