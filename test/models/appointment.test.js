import { expect } from 'chai';
import { sequelize, User, Employee, Service, Appointment } from '../../src/models';

describe('Appointment Model', () => {
  before(async () => {
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
      price: 30.00,
    });
  });

  it('should create an appointment', async () => {
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