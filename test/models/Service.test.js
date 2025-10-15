import { expect } from 'chai';
import db from '../../src/models';

describe('Service Model', () => {
  before(async () => {
    await db.sequelize.sync({ force: true });
  });

  it('should create a service with correct gender_target', async () => {
    const service = await db.Service.create({
      gender_target: 'female',
      washing: true,
      cutting: true,
      coloring: false,
      price: 45.00,
    });
    expect(service.gender_target).to.equal('female');
  });
});