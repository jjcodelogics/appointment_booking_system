import { expect } from 'chai';
import db from '../../src/models/index.js';
const { sequelize, User, Employee, Service, Appointment } = db;

describe('Appointment Model', function () {
  this.timeout(10000);

  before(async function () {
    await sequelize.sync({ force: true });
    // Create dependencies
    await User.create({
      username_email: 'appt@example.com',
      name: 'Appt User',
      password: 'password',
    });
    await Employee.create({
      full_name: 'Emp Appt',
      weekly_hours: 40,
    });
    await Service.create({
      gender_target: 'male',
      washing: true,
      cutting: true,
      coloring: false,
      price: 30.0,
    });
  });

  it('should create an appointment', async function () {
    const appt = await Appointment.create({
      user_id: 1,
      appointment_date: new Date(),
      status: 'scheduled',
      notes: 'Test appointment',
      service_id: 1,
      employee_id: 1,
      reminder_sent: false,
    });
    expect(appt.status).to.equal('scheduled');
    expect(appt.reminder_sent).to.be.false;
  });
});
